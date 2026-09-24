<?php

namespace App\Domain\Cms\Actions;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;
use Symfony\Component\HtmlSanitizer\Visitor\AttributeSanitizer\AttributeSanitizerInterface;

class SanitizeCmsRichTextAction
{
    public const MaxInputBytes = 20_000;

    private readonly HtmlSanitizer $sanitizer;

    public function __construct()
    {
        $textAlignmentSanitizer = new class implements AttributeSanitizerInterface
        {
            public function getSupportedElements(): ?array
            {
                return ['p'];
            }

            public function getSupportedAttributes(): ?array
            {
                return ['style'];
            }

            public function sanitizeAttribute(
                string $element,
                string $attribute,
                string $value,
                HtmlSanitizerConfig $config,
            ): ?string {
                if (
                    $element !== 'p'
                    || $attribute !== 'style'
                    || preg_match('/\A\s*text-align\s*:\s*(left|center|right|justify)\s*;?\s*\z/i', $value, $matches) !== 1
                ) {
                    return null;
                }

                return 'text-align: '.strtolower($matches[1]);
            }
        };

        $config = (new HtmlSanitizerConfig)
            ->allowElement('p', ['style'])
            ->allowElement('br')
            ->allowElement('strong')
            ->allowElement('b')
            ->allowElement('em')
            ->allowElement('i')
            ->allowElement('u')
            ->allowElement('s')
            ->allowElement('del')
            ->allowElement('strike')
            ->allowElement('ul')
            ->allowElement('ol')
            ->allowElement('li')
            ->withAttributeSanitizer($textAlignmentSanitizer)
            ->withMaxInputLength(self::MaxInputBytes);

        $this->sanitizer = new HtmlSanitizer($config);
    }

    public function execute(string $html): string
    {
        return $this->sanitizer->sanitize($html);
    }

    public function characterCount(string $html): int
    {
        $htmlWithBreakSpaces = str_ireplace('<br>', ' ', $html);
        $text = html_entity_decode(strip_tags($htmlWithBreakSpaces), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return mb_strlen($text);
    }
}
