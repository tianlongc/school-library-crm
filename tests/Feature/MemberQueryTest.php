<?php

use App\Domain\Member\Enums\MemberStatus;
use App\Domain\Member\Models\Member;
use App\Domain\Member\Queries\MemberQuery;
use App\Domain\User\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->memberQuery = app(MemberQuery::class);
});

describe('member query', function () {
    it('returns 12 members per page', function () {
        Member::factory()
            ->count(13)
            ->create();

        $members = $this->memberQuery->getMemberList();

        expect($members->perPage())
            ->toBe(12)
            ->and($members->count())
            ->toBe(12)
            ->and($members->total())
            ->toBe(13);
    });

    it('returns newest members first', function () {
        $oldest = Member::factory()->create([
            'created_at' => now()->subDays(2),
        ]);

        $middle = Member::factory()->create([
            'created_at' => now()->subDay(),
        ]);

        $newest = Member::factory()->create([
            'created_at' => now(),
        ]);

        $members = $this->memberQuery->getMemberList();

        expect($members->items())
            ->toHaveCount(3)
            ->and($members->items()[0]->id)
            ->toBe($newest->id)
            ->and($members->items()[1]->id)
            ->toBe($middle->id)
            ->and($members->items()[2]->id)
            ->toBe($oldest->id);
    });

    it('searches by member number', function () {
        $matchingMember = Member::factory()->create([
            'member_number' => 'MEM-2026-0001',
        ]);

        Member::factory()->create([
            'member_number' => 'MEM-2026-9999',
        ]);

        $members = $this->memberQuery->getMemberList(
            '0001'
        );

        expect($members->total())
            ->toBe(1)
            ->and($members->first()->id)
            ->toBe($matchingMember->id);
    });

    it('searches by user name', function () {
        $matchingUser = User::factory()->create([
            'name' => 'Alice Tan',
            'email' => 'alice@example.com',
        ]);

        $matchingMember = Member::factory()
            ->for($matchingUser)
            ->create();

        $otherUser = User::factory()->create([
            'name' => 'Bob Lim',
            'email' => 'bob@example.com',
        ]);

        Member::factory()
            ->for($otherUser)
            ->create();

        $members = $this->memberQuery->getMemberList(
            'Alice'
        );

        expect($members->total())
            ->toBe(1)
            ->and($members->first()->id)
            ->toBe($matchingMember->id);
    });

    it('searches by user email', function () {
        $matchingUser = User::factory()->create([
            'name' => 'Alice Tan',
            'email' => 'alice.tan@example.com',
        ]);

        $matchingMember = Member::factory()
            ->for($matchingUser)
            ->create();

        $otherUser = User::factory()->create([
            'name' => 'Bob Lim',
            'email' => 'bob@example.com',
        ]);

        Member::factory()
            ->for($otherUser)
            ->create();

        $members = $this->memberQuery->getMemberList(
            'alice.tan'
        );

        expect($members->total())
            ->toBe(1)
            ->and($members->first()->id)
            ->toBe($matchingMember->id);
    });

    it('filters active members', function () {
        $activeMember = Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        Member::factory()->create([
            'status' => MemberStatus::Suspended,
        ]);

        Member::factory()->create([
            'status' => MemberStatus::Inactive,
        ]);

        $members = $this->memberQuery->getMemberList(
            status: MemberStatus::Active,
        );

        expect($members->total())
            ->toBe(1)
            ->and($members->first()->id)
            ->toBe($activeMember->id)
            ->and($members->first()->status)
            ->toBe(MemberStatus::Active);
    });

    it('filters suspended members', function () {
        Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        $suspendedMember = Member::factory()->create([
            'status' => MemberStatus::Suspended,
        ]);

        Member::factory()->create([
            'status' => MemberStatus::Inactive,
        ]);

        $members = $this->memberQuery->getMemberList(
            status: MemberStatus::Suspended,
        );

        expect($members->total())
            ->toBe(1)
            ->and($members->first()->id)
            ->toBe($suspendedMember->id)
            ->and($members->first()->status)
            ->toBe(MemberStatus::Suspended);
    });

    it('filters inactive members', function () {
        Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        Member::factory()->create([
            'status' => MemberStatus::Suspended,
        ]);

        $inactiveMember = Member::factory()->create([
            'status' => MemberStatus::Inactive,
        ]);

        $members = $this->memberQuery->getMemberList(
            status: MemberStatus::Inactive,
        );

        expect($members->total())
            ->toBe(1)
            ->and($members->first()->id)
            ->toBe($inactiveMember->id)
            ->and($members->first()->status)
            ->toBe(MemberStatus::Inactive);
    });

    it('combines search and status filters', function () {
        $aliceActiveUser = User::factory()->create([
            'name' => 'Alice Tan',
            'email' => 'alice.active@example.com',
        ]);

        $expectedMember = Member::factory()
            ->for($aliceActiveUser)
            ->create([
                'status' => MemberStatus::Active,
            ]);

        $aliceSuspendedUser = User::factory()->create([
            'name' => 'Alice Lim',
            'email' => 'alice.suspended@example.com',
        ]);

        Member::factory()
            ->for($aliceSuspendedUser)
            ->create([
                'status' => MemberStatus::Suspended,
            ]);

        $bobActiveUser = User::factory()->create([
            'name' => 'Bob Tan',
            'email' => 'bob@example.com',
        ]);

        Member::factory()
            ->for($bobActiveUser)
            ->create([
                'status' => MemberStatus::Active,
            ]);

        $members = $this->memberQuery->getMemberList(
            search: 'Alice',
            status: MemberStatus::Active,
        );

        expect($members->total())
            ->toBe(1)
            ->and($members->first()->id)
            ->toBe($expectedMember->id);
    });

    it('eager loads relationships required by the member resource', function () {
        Member::factory()->create();

        $members = $this->memberQuery->getMemberList();

        $member = $members->first();

        expect($member->relationLoaded('user'))
            ->toBeTrue();
    });

    it('preserves search and status in pagination links', function () {
        Member::factory()
            ->count(20)
            ->create([
                'status' => MemberStatus::Active,
            ]);

        request()->query->replace([
            'search' => 'MEM',
            'status' => MemberStatus::Active->value,
        ]);

        $members = $this->memberQuery->getMemberList(
            search: 'MEM',
            status: MemberStatus::Active,
        );

        $pageTwoUrl = $members->url(2);

        parse_str(
            parse_url($pageTwoUrl, PHP_URL_QUERY),
            $queryParameters
        );

        expect($queryParameters['search'])
            ->toBe('MEM')
            ->and($queryParameters['status'])
            ->toBe(MemberStatus::Active->value)
            ->and($queryParameters['page'])
            ->toBe('2');
    });
});
