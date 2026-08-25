<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrgSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_bn',
        'tagline',
        'registration_no',
        'phone',
        'email',
        'address',
        'primary_color',
    ];
}
