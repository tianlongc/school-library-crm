import CommunityPostCard from "./CommunityPostCard";

export default function CommunityFeed({
    posts,
    onDeleted,
}) {
    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <CommunityPostCard
                    key={post.id}
                    post={post}
                    onDeleted={onDeleted}
                />
            ))}
        </div>
    );
}