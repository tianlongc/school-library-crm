<?php

namespace App\Domain\Community\Enums;

enum CommunityPostStatus: string
{
    case Published = 'published';
    case Hidden = 'hidden';
}
