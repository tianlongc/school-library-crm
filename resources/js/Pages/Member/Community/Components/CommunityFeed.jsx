import CommunityPostCard from "./CommunityPostCard";

export default function CommunityFeed({
    bookOptions,
    posts,
    onDeleted,
}) {
    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <CommunityPostCard
                    bookOptions={bookOptions}
                    key={post.id}
                    post={post}
                    onDeleted={onDeleted}
                />
            ))}
        </div>
    );
}
