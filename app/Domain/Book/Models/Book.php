<?php

namespace App\Domain\Book\Models;

use Database\Factories\BookFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['title', 'author', 'description', 'isbn', 'total_copies'])]
#[UseFactory(BookFactory::class)]
class Book extends Model
{
    use HasFactory, SoftDeletes;
}
