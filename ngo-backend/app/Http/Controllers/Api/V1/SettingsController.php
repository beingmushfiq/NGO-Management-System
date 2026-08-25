<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\OrgSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(): JsonResponse
    {
        $org = OrgSetting::first();

        if (!$org) {
            $org = OrgSetting::create([
                'name'            => 'ASHA Microfinance NGO',
                'name_bn'         => 'আশা ক্ষুদ্রঋণ সংস্থা',
                'tagline'         => 'Empowering Communities, Transforming Lives',
                'registration_no' => 'MRA-REG-2018-0924',
                'phone'           => '16255',
                'email'           => 'support@asha-ngo.org',
                'address'         => 'Level 4, Asha Bhaban, Ring Road, Mohammadpur, Dhaka-1207',
                'primary_color'   => '#0f766e',
            ]);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'name'           => $org->name,
                'nameBn'         => $org->name_bn,
                'tagline'        => $org->tagline,
                'registrationNo' => $org->registration_no,
                'phone'          => $org->phone,
                'email'          => $org->email,
                'address'        => $org->address,
                'primaryColor'   => $org->primary_color,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'            => 'sometimes|required|string|max:150',
            'name_bn'         => 'nullable|string|max:150',
            'tagline'         => 'nullable|string|max:255',
            'registration_no' => 'sometimes|required|string|max:100',
            'phone'           => 'sometimes|required|string|max:50',
            'email'           => 'sometimes|required|email|max:100',
            'address'         => 'sometimes|required|string',
            'primary_color'   => 'nullable|string|max:20',
        ]);

        $org = OrgSetting::first() ?? new OrgSetting();
        $org->fill($validated);
        $org->save();

        return response()->json([
            'success' => true,
            'message' => 'Organization branding and identity updated.',
            'data'    => [
                'name'           => $org->name,
                'nameBn'         => $org->name_bn,
                'tagline'        => $org->tagline,
                'registrationNo' => $org->registration_no,
                'phone'          => $org->phone,
                'email'          => $org->email,
                'address'        => $org->address,
                'primaryColor'   => $org->primary_color,
            ],
        ]);
    }
}
