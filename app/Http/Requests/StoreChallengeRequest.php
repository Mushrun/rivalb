<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreChallengeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isUsdt = $this->input('currency') === 'usdt';

        return [
            'type'       => ['required', 'in:1v1,3v3'],
            'game'       => ['required', 'string', 'max:100'],
            'bet_amount' => [
                'required', 'numeric', 'min:0.01',
                $isUsdt ? 'max:3' : 'integer',
            ],
            'currency'   => ['nullable', 'in:rb,usdt'],
            'visibility' => ['required', 'in:public,prive'],
            'rules'      => ['nullable', 'array'],
        ];
    }
}
