<?php

use App\Domain\Member\Actions\DeactivateMemberAction;
use App\Domain\Member\Actions\ReactivateMemberAction;
use App\Domain\Member\Actions\SuspendMemberAction;
use App\Domain\Member\Enums\MemberStatus;
use App\Domain\Member\Models\Member;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

describe('member status actions', function () {
    it('suspends an active member', function () {
        $member = Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        $result = app(SuspendMemberAction::class)->execute($member);

        expect($result->status)
            ->toBe(MemberStatus::Suspended);

        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'status' => MemberStatus::Suspended->value,
        ]);
    });

    it('deactivates an active member', function () {
        $member = Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        $result = app(DeactivateMemberAction::class)->execute($member);

        expect($result->status)
            ->toBe(MemberStatus::Inactive);

        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'status' => MemberStatus::Inactive->value,
        ]);
    });

    it('deactivates a suspended member', function () {
        $member = Member::factory()->create([
            'status' => MemberStatus::Suspended,
        ]);

        $result = app(DeactivateMemberAction::class)->execute($member);

        expect($result->status)
            ->toBe(MemberStatus::Inactive);

        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'status' => MemberStatus::Inactive->value,
        ]);
    });

    it('reactivates a suspended member', function () {
        $member = Member::factory()->create([
            'status' => MemberStatus::Suspended,
        ]);

        $result = app(ReactivateMemberAction::class)->execute($member);

        expect($result->status)
            ->toBe(MemberStatus::Active);

        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'status' => MemberStatus::Active->value,
        ]);
    });

    it('reactivates an inactive member', function () {
        $member = Member::factory()->create([
            'status' => MemberStatus::Inactive,
        ]);

        $result = app(ReactivateMemberAction::class)->execute($member);

        expect($result->status)
            ->toBe(MemberStatus::Active);

        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'status' => MemberStatus::Active->value,
        ]);
    });

    it('does not allow a suspended member to be suspended again', function () {
        $member = Member::factory()->create([
            'status' => MemberStatus::Suspended,
        ]);

        expect(
            fn () => app(SuspendMemberAction::class)->execute($member)
        )->toThrow(ValidationException::class);

        expect($member->fresh()->status)
            ->toBe(MemberStatus::Suspended);

        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'status' => MemberStatus::Suspended->value,
        ]);
    });

    it('does not allow an inactive member to be suspended', function () {
        $member = Member::factory()->create([
            'status' => MemberStatus::Inactive,
        ]);

        expect(
            fn () => app(SuspendMemberAction::class)->execute($member)
        )->toThrow(ValidationException::class);

        expect($member->fresh()->status)
            ->toBe(MemberStatus::Inactive);

        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'status' => MemberStatus::Inactive->value,
        ]);
    });

    it('does not allow an inactive member to be deactivated again', function () {
        $member = Member::factory()->create([
            'status' => MemberStatus::Inactive,
        ]);

        expect(
            fn () => app(DeactivateMemberAction::class)->execute($member)
        )->toThrow(ValidationException::class);

        expect($member->fresh()->status)
            ->toBe(MemberStatus::Inactive);

        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'status' => MemberStatus::Inactive->value,
        ]);
    });

    it('does not allow an active member to be reactivated', function () {
        $member = Member::factory()->create([
            'status' => MemberStatus::Active,
        ]);

        expect(
            fn () => app(ReactivateMemberAction::class)->execute($member)
        )->toThrow(ValidationException::class);

        expect($member->fresh()->status)
            ->toBe(MemberStatus::Active);

        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'status' => MemberStatus::Active->value,
        ]);
    });
});
