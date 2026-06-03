<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreChallengeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type'       => ['required', 'in:1v1,3v3'],
            'game'       => ['required', 'string', 'max:100'],
            'bet_amount' => ['required', 'integer', 'min:1'],
            'currency'   => ['nullable', 'in:rb,usdt'],
            'visibility' => ['required', 'in:public,prive'],
            'rules'      => ['nullable', 'array'],
        ];
    }
}
