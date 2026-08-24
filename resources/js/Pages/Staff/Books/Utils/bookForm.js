export const buildBookFormData = (data) => {
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('author', data.author);
    formData.append('isbn', data.isbn);
    formData.append('description', data.description ?? '');
    formData.append('total_copies', data.total_copies);

    return formData;
};
