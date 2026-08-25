<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CollectionResource;
use App\Models\Collection;
use App\Models\OrgSetting;
use App\Services\ProcessCollectionService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class CollectionController extends Controller
{
    public function __construct(
        protected ProcessCollectionService $collectionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Collection::with(['customer', 'branch', 'staff', 'allocations.loan', 'allocations.installment', 'allocations.savingsAccount']);

        if ($user && $user->role === 'staff') {
            $query->where('branch_id', $user->branch_id);
        } elseif ($request->filled('branch_id')) {
            $query->where('branch_id', $request->query('branch_id'));
        }

        if ($request->filled('staff_id')) {
            $query->where('staff_id', $request->query('staff_id'));
        }

        if ($request->filled('date')) {
            $query->where('collection_date', $request->query('date'));
        }

        if ($request->filled('search')) {
            $term = $request->query('search');
            $query->where(function ($q) use ($term) {
                $q->where('receipt_number', 'LIKE', "%{$term}%")
                  ->orWhereHas('customer', function ($cq) use ($term) {
                      $cq->where('name', 'LIKE', "%{$term}%")
                         ->orWhere('customer_code', 'LIKE', "%{$term}%")
                         ->orWhere('phone', 'LIKE', "%{$term}%");
                  });
            });
        }

        $collections = $query->orderBy('id', 'desc')->paginate($request->query('per_page', 50));

        return response()->json([
            'success' => true,
            'data'    => CollectionResource::collection($collections->items()),
            'meta'    => [
                'currentPage' => $collections->currentPage(),
                'lastPage'    => $collections->lastPage(),
                'total'       => $collections->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id'       => 'required|exists:customers,id',
            'loan_id'           => 'nullable|exists:loans,id',
            'installment_id'    => 'nullable|exists:loan_installments,id',
            'loan_amount'       => 'nullable|numeric|min:0',
            'savings_amount'    => 'nullable|numeric|min:0',
            'payment_method'    => 'nullable|in:cash,mobile_banking,bank,other',
            'payment_reference' => 'nullable|string|max:100',
            'collection_date'   => 'nullable|date',
            'idempotency_key'   => 'nullable|string|max:64',
        ]);

        try {
            $collection = $this->collectionService->execute($validated, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Collection processed successfully and money receipt generated.',
                'data'    => new CollectionResource($collection),
            ], 200);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'code'    => 'INVALID_COLLECTION_AMOUNTS',
            ], 400);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing the collection: ' . $e->getMessage(),
                'code'    => 'COLLECTION_PROCESSING_FAILED',
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        $collection = Collection::with([
            'customer',
            'branch',
            'staff',
            'allocations.loan',
            'allocations.installment',
            'allocations.savingsAccount',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => new CollectionResource($collection),
        ]);
    }

    public function receipt(int $id): JsonResponse
    {
        $collection = Collection::with([
            'customer',
            'branch',
            'staff',
            'allocations.loan',
            'allocations.installment',
            'allocations.savingsAccount',
        ])->findOrFail($id);

        $org = OrgSetting::first();
        $loanAlloc = $collection->allocations->firstWhere('type', 'loan');
        $savingsAlloc = $collection->allocations->firstWhere('type', 'savings');

        return response()->json([
            'success' => true,
            'data'    => [
                'organization' => [
                    'name'           => $org?->name ?? 'ASHA Microfinance NGO',
                    'nameBn'         => $org?->name_bn ?? 'আশা ক্ষুদ্রঋণ সংস্থা',
                    'registrationNo' => $org?->registration_no ?? 'MRA-REG-2018-0924',
                    'helpline'       => $org?->phone ?? '16255',
                    'address'        => $org?->address ?? 'Level 4, Asha Bhaban, Ring Road, Mohammadpur, Dhaka-1207',
                ],
                'receipt' => [
                    'receiptNo'            => $collection->receipt_number,
                    'collectionDate'       => $collection->collection_date?->format('Y-m-d'),
                    'collectedAt'          => $collection->created_at?->format('d M Y, h:i A'),
                    'paymentMethod'        => strtoupper($collection->payment_method),
                    'paymentReference'     => $collection->payment_reference,
                    'customerCode'         => $collection->customer->customer_code,
                    'customerName'         => $collection->customer->name,
                    'customerNameBn'       => $collection->customer->name_bn,
                    'phone'                => $collection->customer->phone,
                    'branchName'           => $collection->branch->name,
                    'staffName'            => $collection->staff->name,
                    'staffCode'            => $collection->staff->staff_code,
                    'installmentNo'        => $loanAlloc?->installment?->installment_number ?? 1,
                    'loanAmount'           => (string) ($loanAlloc?->amount ?? '0.00'),
                    'savingsAmount'        => (string) ($savingsAlloc?->amount ?? '0.00'),
                    'totalAmount'          => (string) $collection->total_amount,
                    'loanBalanceBefore'    => (string) ($collection->loan_balance_before ?? '0.00'),
                    'loanBalanceAfter'     => (string) ($collection->loan_balance_after ?? '0.00'),
                    'savingsBalanceBefore' => (string) ($collection->savings_balance_before ?? '0.00'),
                    'savingsBalanceAfter'  => (string) ($collection->savings_balance_after ?? '0.00'),
                ],
            ],
        ]);
    }
}
