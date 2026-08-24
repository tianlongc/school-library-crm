<?php

namespace App\Http\Controllers;

use App\Http\Queries\BookQuery;
use App\Http\Requests\StoreBookRequest;
use App\Http\Requests\UpdateBookRequest;
use App\Http\Resources\BookResource;
use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, BookQuery $query): Response
    {
        $search = (string) $request->string('search')->trim();

        return Inertia::render('Admin/Books/Index', [
            'books' => BookResource::collection($query->getBookList($search)),
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Books/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBookRequest $request): JsonResponse
    {
        $book = Book::create([
            'title' => $request->title,
            'author' => $request->author,
            'description' => $request->description,
            'isbn' => $request->isbn,
            'total_copies' => $request->total_copies,
        ]);

        return response()->json([
            'message' => 'Book created successfully',
            'book' => BookResource::make($book)->resolve($request),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Book $book): Response
    {
        return Inertia::render('Admin/Books/Show', [
            'book' => BookResource::make($book)->resolve(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Book $book): Response
    {
        return Inertia::render('Admin/Books/Edit', [
            'book' => BookResource::make($book)->resolve(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBookRequest $request, Book $book): JsonResponse
    {
        $book->updateOrFail([
            'title' => $request->title,
            'author' => $request->author,
            'description' => $request->description,
            'isbn' => $request->isbn,
            'total_copies' => $request->total_copies,
        ]);

        return response()->json([
            'message' => 'Book updated successfully',
            'book' => BookResource::make($book)->resolve($request),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Book $book): JsonResponse
    {
        $book->deleteOrFail();

        return response()->json([
            'message' => 'Book deleted successfully',
        ]);
    }
}
