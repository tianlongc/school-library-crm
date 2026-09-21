<?php

namespace App\Http\Requests\Community;

use App\Domain\Community\Models\CommunityPost;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCommunityPostCommentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $post = $this->route('post');

        return $post instanceof CommunityPost
            && $this->user()?->can('comment', $post) === true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'body' => [
                'required',
                'string',
                'max:1000',
            ],
        ];
    }
}
