export const buildBookFormData = (data) => {
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('author', data.author);
    formData.append('isbn', data.isbn);
    formData.append('description', data.description ?? '');
    formData.append('total_copies', data.total_copies);
    formData.append('category_id', data.category_id ?? '');

    if (data.cover) {
        formData.append('cover', data.cover);
    }

    return formData;
};
