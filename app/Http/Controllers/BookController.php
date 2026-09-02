<?php

namespace App\Http\Controllers;

use App\Domain\Book\Actions\CreateBookAction;
use App\Domain\Book\Actions\DeleteBookAction;
use App\Domain\Book\Actions\UpdateBookAction;
use App\Domain\Book\Models\Book;
use App\Domain\Book\Queries\BookQuery;
use App\Domain\Category\Queries\CategoryQuery;
use App\Http\Requests\BookIndexRequest;
use App\Http\Requests\StoreBookRequest;
use App\Http\Requests\UpdateBookRequest;
use App\Http\Resources\BookResource;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(BookIndexRequest $request, BookQuery $query): Response
    {
        return Inertia::render('Staff/Books/Index', [
            'books' => fn () => BookResource::collection(
                $this->bookList($request, $query)
            ),
            'filters' => $request->filters(),
        ]);
    }

    public function query(BookIndexRequest $request, BookQuery $query): AnonymousResourceCollection
    {
        return BookResource::collection(
            $this->bookList($request, $query),
        )->additional([
            'filters' => $request->filters(),
        ]);
    }

    private function bookList(BookIndexRequest $request, BookQuery $query): LengthAwarePaginator
    {
        return $query->getBookList(
            search: $request->search(),
            page: $request->page(),
            perPage: $request->perPage(),
            sort: $request->sort(),
            direction: $request->direction(),
        );
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(CategoryQuery $query): Response
    {
        return Inertia::render('Staff/Books/Create', [
            'categories' => $query->getOptions(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBookRequest $request, CreateBookAction $action): JsonResponse
    {
        $book = $action->execute(
            attributes: [
                'title' => $request->input('title'),
                'author' => $request->input('author'),
                'description' => $request->input('description'),
                'isbn' => $request->input('isbn'),
                'total_copies' => $request->input('total_copies'),
                'category_id' => $request->input('category_id'),
            ]
        );

        return response()->json([
            'message' => 'Book created successfully',
            'book' => BookResource::make($book)->resolve($request),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Book $book, BookQuery $query): Response
    {
        return Inertia::render('Staff/Books/Show', [
            'book' => BookResource::make(
                $query->loadAvailability($book),
            )->resolve(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Book $book, CategoryQuery $query): Response
    {
        return Inertia::render('Staff/Books/Edit', [
            'book' => BookResource::make($book)->resolve(),
            'categories' => $query->getOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBookRequest $request, Book $book, UpdateBookAction $action): JsonResponse
    {
        $book = $action->execute(
            book: $book,
            attributes: [
                'title' => $request->input('title'),
                'author' => $request->input('author'),
                'isbn' => $request->input('isbn'),
                'description' => $request->input('description'),
                'total_copies' => $request->input('total_copies'),
                'category_id' => $request->input('category_id'),
            ],
        );

        return response()->json([
            'message' => 'Book updated successfully',
            'book' => BookResource::make($book)->resolve($request),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Book $book, DeleteBookAction $action): JsonResponse
    {
        $action->execute(book: $book);

        return response()->json([
            'message' => 'Book deleted successfully',
        ]);
    }
}
