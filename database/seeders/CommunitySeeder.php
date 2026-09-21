<?php

namespace Database\Seeders;

use App\Domain\Book\Models\Book;
use App\Domain\Community\Enums\CommunityPostStatus;
use App\Domain\Community\Models\CommunityPost;
use App\Domain\Community\Models\CommunityPostComment;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CommunitySeeder extends Seeder
{
    /**
     * @var array<string, array{name: string, email: string, member_number: string}>
     */
    private const AUTHOR_DEFINITIONS = [
        'aisha' => [
            'name' => 'Aisha Rahman',
            'email' => 'community.aisha@example.test',
            'member_number' => 'COMM0001',
        ],
        'ben' => [
            'name' => 'Ben Carter',
            'email' => 'community.ben@example.test',
            'member_number' => 'COMM0002',
        ],
        'clara' => [
            'name' => 'Clara Lim',
            'email' => 'community.clara@example.test',
            'member_number' => 'COMM0003',
        ],
        'daniel' => [
            'name' => 'Daniel Wong',
            'email' => 'community.daniel@example.test',
            'member_number' => 'COMM0004',
        ],
        'elena' => [
            'name' => 'Elena Garcia',
            'email' => 'community.elena@example.test',
            'member_number' => 'COMM0005',
        ],
        'reader' => [
            'name' => 'Community Reader',
            'email' => 'community.reader@example.test',
            'member_number' => 'COMM0006',
        ],
    ];

    /**
     * @var array<string, array{title: string, author: string, isbn: string}>
     */
    private const BOOK_DEFINITIONS = [
        'midnight-library' => [
            'title' => 'The Midnight Library',
            'author' => 'Matt Haig',
            'isbn' => '9780525559474',
        ],
        'small-things' => [
            'title' => 'A Thousand Small Things',
            'author' => 'J. K. Park',
            'isbn' => '9780000000001',
        ],
        'ocean-at-end' => [
            'title' => 'The Ocean at the End of the Lane',
            'author' => 'Neil Gaiman',
            'isbn' => '9780062255655',
        ],
        'quiet-garden' => [
            'title' => 'The Quiet Garden',
            'author' => 'Mina Chen',
            'isbn' => '9780000000002',
        ],
        'long-way-home' => [
            'title' => 'The Long Way Home',
            'author' => 'Louise Penny',
            'isbn' => '9781250022063',
        ],
    ];

    /**
     * @var list<array{author: string, body: string, book?: string}>
     */
    private const POST_DEFINITIONS = [
        ['author' => 'aisha', 'body' => 'What book helped you see a familiar place differently?', 'book' => 'midnight-library'],
        ['author' => 'ben', 'body' => 'Which first chapter pulled you in immediately?', 'book' => 'ocean-at-end'],
        ['author' => 'clara', 'body' => 'I am looking for a thoughtful mystery with a strong setting.', 'book' => 'long-way-home'],
        ['author' => 'daniel', 'body' => 'What are you reading when you need a quiet evening?', 'book' => 'quiet-garden'],
        ['author' => 'elena', 'body' => 'I finished a book that made me call an old friend. Any similar recommendations?', 'book' => 'small-things'],
        ['author' => 'aisha', 'body' => 'Do you prefer reading one long novel or several short books at once?'],
        ['author' => 'ben', 'body' => 'The best stories leave a question behind. What is one that stayed with you?'],
        ['author' => 'clara', 'body' => 'I need a recommendation for a book club with mixed reading tastes.', 'book' => 'midnight-library'],
        ['author' => 'daniel', 'body' => 'Which author would you like to see featured in our next library display?'],
        ['author' => 'elena', 'body' => 'I am collecting short stories for a weekend train ride.', 'book' => 'ocean-at-end'],
        ['author' => 'aisha', 'body' => 'What is the most memorable library scene you have read?'],
        ['author' => 'ben', 'body' => 'Has a fictional character ever changed how you think about a real problem?'],
        ['author' => 'clara', 'body' => 'I am recommending this to anyone who enjoys gentle, hopeful stories.', 'book' => 'quiet-garden'],
        ['author' => 'daniel', 'body' => 'What is your favourite way to keep track of books you want to read?'],
        ['author' => 'elena', 'body' => 'Looking for a page-turner that is still suitable for a busy week.', 'book' => 'long-way-home'],
        ['author' => 'aisha', 'body' => 'Which book would you lend to someone who says they do not enjoy reading?'],
        ['author' => 'ben', 'body' => 'I just rediscovered a childhood favourite. What book do you return to often?'],
        ['author' => 'clara', 'body' => 'Can anyone recommend a non-fiction book about creativity?'],
        ['author' => 'daniel', 'body' => 'The ending matters, but the journey matters more. Agree or disagree?'],
        ['author' => 'elena', 'body' => 'What is one book you wish you could read again for the first time?'],
        ['author' => 'aisha', 'body' => 'I am searching for a warm, funny read after a demanding month.', 'book' => 'small-things'],
        ['author' => 'ben', 'body' => 'Which book cover made you pick up a book you otherwise might have missed?'],
        ['author' => 'clara', 'body' => 'What makes a recommendation useful to you: genre, mood, or a favourite quote?'],
        ['author' => 'daniel', 'body' => 'I would love a science-fiction recommendation with memorable characters.', 'book' => 'midnight-library'],
        ['author' => 'elena', 'body' => 'Share a title that surprised you by becoming a favourite.'],
    ];

    /**
     * @var list<string>
     */
    private const COMMENT_BODIES = [
        "I like this perspective. I'm adding it to my reading list.",
        "The library has a copy, and I'd be curious to hear what you think.",
        'This reminds me of a title I enjoyed last year. Thanks for sharing.',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $authors = collect(self::AUTHOR_DEFINITIONS)
            ->mapWithKeys(fn (array $definition, string $key): array => [
                $key => $this->findOrCreateAuthor($definition),
            ]);

        $books = collect(self::BOOK_DEFINITIONS)
            ->mapWithKeys(fn (array $definition, string $key): array => [
                $key => Book::query()->firstOrCreate(
                    ['isbn' => $definition['isbn']],
                    [
                        'title' => $definition['title'],
                        'author' => $definition['author'],
                    ],
                ),
            ]);

        $authorKeys = array_keys(self::AUTHOR_DEFINITIONS);

        foreach (self::POST_DEFINITIONS as $postIndex => $definition) {
            $post = CommunityPost::query()->updateOrCreate(
                [
                    'user_id' => $authors[$definition['author']]->id,
                    'body' => $definition['body'],
                ],
                [
                    'book_id' => isset($definition['book'])
                        ? $books[$definition['book']]->id
                        : null,
                    'status' => CommunityPostStatus::Published,
                ],
            );

            foreach (self::COMMENT_BODIES as $commentIndex => $body) {
                $commentAuthor = $authors[
                    $authorKeys[($postIndex + $commentIndex + 1) % count($authorKeys)]
                ];

                CommunityPostComment::query()->firstOrCreate([
                    'community_post_id' => $post->id,
                    'user_id' => $commentAuthor->id,
                    'body' => $body,
                ]);
            }
        }
    }

    /**
     * @param  array{name: string, email: string, member_number: string}  $definition
     */
    private function findOrCreateAuthor(array $definition): User
    {
        $user = User::query()->firstOrCreate(
            ['email' => $definition['email']],
            [
                'name' => $definition['name'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        $user->assignRole('member');

        Member::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['member_number' => $definition['member_number']],
        );

        return $user;
    }
}
