<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Loan;
use App\Models\OrgSetting;
use App\Models\SavingsAccount;
use App\Models\SavingsTransaction;
use App\Models\User;
use App\Services\LoanScheduleGenerator;
use App\Services\ProcessCollectionService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Org Settings
        OrgSetting::create([
            'name'            => 'ASHA Microfinance NGO',
            'name_bn'         => 'আশা ক্ষুদ্রঋণ সংস্থা',
            'tagline'         => 'Empowering Communities, Transforming Lives',
            'registration_no' => 'MRA-REG-2018-0924',
            'phone'           => '16255',
            'email'           => 'support@asha-ngo.org',
            'address'         => 'Level 4, Asha Bhaban, Ring Road, Mohammadpur, Dhaka-1207',
            'primary_color'   => '#0f766e',
        ]);

        // 2. Branches
        $branchDhanmondi = Branch::create([
            'code'    => 'BR-01',
            'name'    => 'Dhanmondi Branch',
            'name_bn' => 'ধানমন্ডি শাখা',
            'address' => 'House 42, Road 7A, Dhanmondi, Dhaka',
            'phone'   => '01711-100001',
            'email'   => 'dhanmondi@asha-ngo.org',
            'status'  => 'active',
        ]);

        $branchMirpur = Branch::create([
            'code'    => 'BR-02',
            'name'    => 'Mirpur Branch',
            'name_bn' => 'মিরপুর শাখা',
            'address' => 'Plot 12, Section 10, Mirpur, Dhaka',
            'phone'   => '01711-100002',
            'email'   => 'mirpur@asha-ngo.org',
            'status'  => 'active',
        ]);

        $branchUttara = Branch::create([
            'code'    => 'BR-03',
            'name'    => 'Uttara Branch',
            'name_bn' => 'উত্তরা শাখা',
            'address' => 'Sector 3, Uttara, Dhaka',
            'phone'   => '01711-100003',
            'email'   => 'uttara@asha-ngo.org',
            'status'  => 'active',
        ]);

        // 3. Users (Admin, Staff, Customer)
        $admin = User::create([
            'name'       => 'Nurul Islam (Executive Director)',
            'email'      => 'admin@asha.org',
            'phone'      => '01711-000001',
            'password'   => Hash::make('password123'),
            'branch_id'  => $branchDhanmondi->id,
            'role'       => 'admin',
            'staff_code' => 'STF-001',
            'status'     => 'active',
        ]);

        $staff1 = User::create([
            'name'       => 'Kamal Hossain (Credit Officer)',
            'email'      => 'kamal@asha.org',
            'phone'      => '01711-000002',
            'password'   => Hash::make('password123'),
            'branch_id'  => $branchDhanmondi->id,
            'role'       => 'staff',
            'staff_code' => 'STF-002',
            'status'     => 'active',
        ]);

        $staff2 = User::create([
            'name'       => 'Farhana Akter (Field Officer)',
            'email'      => 'farhana@asha.org',
            'phone'      => '01711-000003',
            'password'   => Hash::make('password123'),
            'branch_id'  => $branchMirpur->id,
            'role'       => 'staff',
            'staff_code' => 'STF-003',
            'status'     => 'active',
        ]);

        // 4. Customers & Linked Savings Accounts
        $customersData = [
            [
                'code'       => 'CUS-1024',
                'name'       => 'Rahima Begum',
                'name_bn'    => 'রহিমা বেগম',
                'phone'      => '01712-345678',
                'nid'        => '19872691234567890',
                'address'    => 'Ward 4, Jafrabad, Rayerbazar, Dhaka',
                'occupation' => 'Tailoring & Handicrafts',
                'emergency'  => 'Abdul Karim (Husband)',
                'branch_id'  => $branchDhanmondi->id,
                'staff_id'   => $staff1->id,
                'principal'  => 50000,
                'sav_bal'    => 4800,
            ],
            [
                'code'       => 'CUS-1025',
                'name'       => 'Fatema Khatun',
                'name_bn'    => 'ফাতেমা খাতুন',
                'phone'      => '01819-876543',
                'nid'        => '19902699876543210',
                'address'    => 'Block C, Section 11, Mirpur, Dhaka',
                'occupation' => 'Poultry & Dairy',
                'emergency'  => 'Mohammad Ali (Brother)',
                'branch_id'  => $branchMirpur->id,
                'staff_id'   => $staff2->id,
                'principal'  => 30000,
                'sav_bal'    => 2600,
            ],
            [
                'code'       => 'CUS-1026',
                'name'       => 'Anwara Begum',
                'name_bn'    => 'আনোয়ারা বেগম',
                'phone'      => '01911-223344',
                'nid'        => '19852691122334455',
                'address'    => 'Sankar, West Dhanmondi, Dhaka',
                'occupation' => 'Grocery Shop',
                'emergency'  => 'Shah Alam (Husband)',
                'branch_id'  => $branchDhanmondi->id,
                'staff_id'   => $staff1->id,
                'principal'  => 40000,
                'sav_bal'    => 3200,
            ],
            [
                'code'       => 'CUS-1027',
                'name'       => 'Jahanara Alam',
                'name_bn'    => 'জাহানারা আলম',
                'phone'      => '01677-556677',
                'nid'        => '19922695566778899',
                'address'    => 'Sector 7, Road 12, Uttara, Dhaka',
                'occupation' => 'Boutique Business',
                'emergency'  => 'Mizanur Rahman (Father)',
                'branch_id'  => $branchUttara->id,
                'staff_id'   => $staff1->id,
                'principal'  => 60000,
                'sav_bal'    => 6500,
            ],
            [
                'code'       => 'CUS-1028',
                'name'       => 'Sultana Razia',
                'name_bn'    => 'সুলতানা রাজিয়া',
                'phone'      => '01552-998877',
                'nid'        => '19882699988776655',
                'address'    => 'Hazaribagh Tannery Area, Dhaka',
                'occupation' => 'Leather Goods Production',
                'emergency'  => 'Harun Rashid (Husband)',
                'branch_id'  => $branchDhanmondi->id,
                'staff_id'   => $staff1->id,
                'principal'  => 25000,
                'sav_bal'    => 1900,
            ],
        ];

        $now = Carbon::now('Asia/Dhaka');
        $collectionService = app(ProcessCollectionService::class);

        foreach ($customersData as $index => $cdata) {
            $customer = Customer::create([
                'customer_code'     => $cdata['code'],
                'name'              => $cdata['name'],
                'name_bn'           => $cdata['name_bn'],
                'phone'             => $cdata['phone'],
                'nid'               => $cdata['nid'],
                'address'           => $cdata['address'],
                'branch_id'         => $cdata['branch_id'],
                'staff_id'          => $cdata['staff_id'],
                'status'            => 'active',
                'occupation'        => $cdata['occupation'],
                'emergency_contact' => $cdata['emergency'],
                'registered_at'     => $now->copy()->subMonths(6),
            ]);

            // Create linked customer user login
            User::create([
                'name'       => $cdata['name'],
                'phone'      => $cdata['phone'],
                'password'   => Hash::make('password123'),
                'branch_id'  => $cdata['branch_id'],
                'role'       => 'customer',
                'status'     => 'active',
            ]);

            // Savings Account
            $savAccount = SavingsAccount::create([
                'customer_id'          => $customer->id,
                'branch_id'            => $customer->branch_id,
                'account_number'       => 'SAV-' . substr($cdata['code'], 4),
                'cached_balance'       => $cdata['sav_bal'],
                'monthly_contribution' => 800.00,
                'status'               => 'active',
                'opened_at'            => $now->copy()->subMonths(6),
            ]);

            // Initial Savings deposit ledger
            SavingsTransaction::create([
                'savings_account_id' => $savAccount->id,
                'type'               => 'deposit',
                'amount'             => $cdata['sav_bal'],
                'balance_before'     => 0.00,
                'balance_after'      => $cdata['sav_bal'],
                'reference_type'     => 'opening_balance',
                'transaction_date'   => $now->copy()->subMonths(6)->format('Y-m-d'),
                'note'               => 'Initial opening savings deposit',
                'created_by'         => $staff1->id,
            ]);

            // Disburse 50-week loan
            $principal = $cdata['principal'];
            $serviceCharge = $principal * 0.10; // 10%
            $totalPayable = $principal + $serviceCharge;
            $installmentAmount = round($totalPayable / 50, 2);

            $loan = Loan::create([
                'loan_number'            => 'LN-2026-' . str_pad((string) (1001 + $index), 5, '0', STR_PAD_LEFT),
                'customer_id'            => $customer->id,
                'branch_id'              => $customer->branch_id,
                'staff_id'               => $customer->staff_id,
                'principal_amount'       => $principal,
                'service_charge_amount'  => $serviceCharge,
                'total_payable_amount'   => $totalPayable,
                'installment_amount'     => $installmentAmount,
                'number_of_installments' => 50,
                'frequency'              => 'weekly',
                'start_date'             => $now->copy()->subWeeks(10)->format('Y-m-d'),
                'end_date'               => $now->copy()->addWeeks(40)->format('Y-m-d'),
                'disbursed_at'           => $now->copy()->subWeeks(10),
                'cached_outstanding'     => $totalPayable,
                'cached_total_paid'      => 0.00,
                'status'                 => 'active',
                'purpose'                => $cdata['occupation'],
                'created_by'             => $admin->id,
            ]);

            // Generate schedule
            $installments = LoanScheduleGenerator::generate($loan);

            // Backfill 3 completed weekly repayments via ProcessCollectionService
            for ($k = 0; $k < 3; $k++) {
                $inst = $installments[$k];
                $collectionService->execute([
                    'customer_id'       => $customer->id,
                    'loan_id'           => $loan->id,
                    'installment_id'    => $inst->id,
                    'loan_amount'       => $inst->expected_amount,
                    'savings_amount'    => '200.00',
                    'payment_method'    => 'cash',
                    'collection_date'   => $now->copy()->subWeeks(3 - $k)->format('Y-m-d'),
                    'idempotency_key'   => "SEED-INIT-{$customer->id}-{$k}",
                ], $staff1);
            }
        }
    }
}
