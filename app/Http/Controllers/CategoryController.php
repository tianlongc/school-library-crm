<?php

namespace App\Http\Controllers;

use App\Domain\Category\Actions\CreateCategoryAction;
use App\Domain\Category\Actions\DeleteCategoryAction;
use App\Domain\Category\Actions\UpdateCategoryAction;
use App\Domain\Category\Models\Category;
use App\Domain\Category\Queries\CategoryQuery;
use App\Http\Requests\CategoryIndexRequest;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(CategoryIndexRequest $request, CategoryQuery $query): Response
    {
        return Inertia::render('Staff/Categories/Index', [
            'categories' => fn () => CategoryResource::collection(
                $this->categoryList($request, $query)
            ),
            'filters' => $request->filters(),
        ]);
    }

    public function query(CategoryIndexRequest $request, CategoryQuery $query): AnonymousResourceCollection
    {
        return CategoryResource::collection(
            $this->categoryList($request, $query),
        )->additional([
            'filters' => $request->filters(),
        ]);
    }

    private function categoryList(CategoryIndexRequest $request, CategoryQuery $query): LengthAwarePaginator
    {
        return $query->getCategoryList(
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
    public function create(): Response
    {
        return Inertia::render('Staff/Categories/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request, CreateCategoryAction $action): JsonResponse
    {
        $category = $action->execute(
            attributes: [
                'name' => $request->input('name'),
            ]
        );

        return response()->json([
            'message' => 'Category created successfully',
            'category' => CategoryResource::make($category)->resolve($request),
        ], 201);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category): Response
    {
        return Inertia::render('Staff/Categories/Edit', [
            'category' => CategoryResource::make($category)->resolve(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category, UpdateCategoryAction $action): JsonResponse
    {
        $category = $action->execute(
            category: $category,
            attributes: [
                'name' => $request->input('name'),
            ],
        );

        return response()->json([
            'message' => 'Category updated successfully',
            'category' => CategoryResource::make($category)->resolve($request),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category, DeleteCategoryAction $action): JsonResponse
    {
        $action->execute(category: $category);

        return response()->json([
            'message' => 'Category deleted successfully',
        ]);
    }
}
