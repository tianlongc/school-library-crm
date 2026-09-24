<?php

namespace Database\Seeders;

use App\Domain\Book\Models\Book;
use App\Domain\Loan\Models\Loan;
use App\Domain\Member\Models\Member;
use App\Domain\User\Models\User;
use Illuminate\Database\Seeder;

class OverdueLoanSeeder extends Seeder
{
    public function run(): void
    {
        $issuer = User::query()
            ->whereHas('roles', fn ($query) => $query->where('name', 'staff'))
            ->first()
            ?? User::factory()->create();

        $members = Member::factory()
            ->count(10)
            ->create();

        $books = Book::factory()
            ->count(20)
            ->create([
                'total_copies' => 5,
            ]);

        for ($i = 0; $i < 20; $i++) {
            $issuedAt = now()->subDays(fake()->numberBetween(20, 90));

            $dueAt = $issuedAt->copy()->addDays(
                fake()->numberBetween(7, 14)
            );

            Loan::query()->create([
                'member_id' => $members->random()->id,
                'book_id' => $books[$i]->id,
                'issued_by_user_id' => $issuer->id,

                'issued_at' => $issuedAt,

                // Guaranteed to be in the past
                'due_at' => $dueAt,

                'return_requested_at' => null,
                'returned_at' => null,
            ]);
        }

        $this->command?->info('20 overdue loans seeded successfully.');
    }
}
