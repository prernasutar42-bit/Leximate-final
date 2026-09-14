# Equit.IO / LexiMate Design Tokens

This file records the existing visual system so new features can reuse it instead of redefining styles.

## Colors

The app uses Tailwind CSS v4 in `src/app/globals.css`; there is no `tailwind.config.*` file. The theme exposes these shadcn-style OKLCH tokens.

| Token | Light | Dark |
|---|---|---|
| `background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` |
| `foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` |
| `card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` |
| `popover-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` |
| `primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` |
| `secondary` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `secondary-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` |
| `muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` |
| `accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` |
| `destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` |
| `border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |
| `input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` |
| `ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` |
| `chart-1` | `oklch(0.646 0.222 41.116)` | `oklch(0.488 0.243 264.376)` |
| `chart-2` | `oklch(0.6 0.118 184.704)` | `oklch(0.696 0.17 162.48)` |
| `chart-3` | `oklch(0.398 0.07 227.392)` | `oklch(0.769 0.188 70.08)` |
| `chart-4` | `oklch(0.828 0.189 84.429)` | `oklch(0.627 0.265 303.9)` |
| `chart-5` | `oklch(0.769 0.188 70.08)` | `oklch(0.645 0.246 16.439)` |

Sidebar tokens mirror the same neutral palette: `sidebar`, `sidebar-foreground`, `sidebar-primary`, `sidebar-primary-foreground`, `sidebar-accent`, `sidebar-accent-foreground`, `sidebar-border`, `sidebar-ring`.

LexiMate also intentionally uses these direct warm colors repeatedly:
- Page background: `#FFF7EF`
- Customize sidebar default background: `#FFF3CE`
- Card background: `#FFFAEF`
- Main text: `#020402`
- Highlight blocks: Tailwind `orange-200`, `yellow-200`, `green-200`
- Canvas paper: `#fffdf8`
- Guide text: `rgba(2, 4, 2, 0.12)`

## Fonts

- Global body font: local **OpenDyslexic Regular** (`public/fonts/OpenDyslexic-Regular.woff2`) via `next/font/local` in `src/app/layout.tsx`.
- Available Customize fonts in `AppSidebar`: **Geist Sans**, **Geist Mono**, **OpenDyslexic**, **Atkinson Hyperlegible**, **Verdana Bold**.
- Geist and Geist Mono are loaded from `next/font/google`.
- Atkinson Hyperlegible is loaded from `next/font/google` at weights 400/700.
- OpenDyslexic uses local Regular/Bold/Italic font assets; the selector currently registers the Regular face.
- Verdana uses `public/fonts/Verdana-Bold.ttf`.
- The Tailwind `font-sans` token maps to `--font-geist-sans`; `font-mono` maps to `--font-geist-mono`.

## Spacing / sizing

There is no custom spacing scale in `globals.css`; Tailwind's default spacing scale is used. The relevant default scale is:

`0=0px`, `px=1px`, `0.5=2px`, `1=4px`, `1.5=6px`, `2=8px`, `2.5=10px`, `3=12px`, `3.5=14px`, `4=16px`, `5=20px`, `6=24px`, `7=28px`, `8=32px`, `9=36px`, `10=40px`, `11=44px`, `12=48px`, `14=56px`, `16=64px`, `20=80px`, `24=96px`, `28=112px`, `32=128px`, `36=144px`, `40=160px`, `44=176px`, `48=192px`, `52=208px`, `56=224px`, `60=240px`, `64=256px`, `72=288px`, `80=320px`, `96=384px`.

Common existing values to reuse:
- `gap-2` = 0.5rem, `gap-3` = 0.75rem, `gap-4` = 1rem, `gap-6` = 1.5rem, `gap-16` = 4rem.
- `p-4` = 1rem, `px-4` = 1rem, `py-4` = 1rem, `px-6` = 1.5rem.
- Interactive controls commonly use `min-h-11` (44px) for accessible touch targets.
- Cards use `rounded-xl`, `border`, `py-6`, and `shadow-sm` in the reusable Card primitive.
- Base radius: `--radius: 0.625rem`; derived radii are `sm = radius - 4px`, `md = radius - 2px`, `lg = radius`, `xl = radius + 4px`.
- LexiMate content commonly uses `max-w-3xl`; cards commonly use `border-2` and `bg-[#FFFAEF]`.

## Reusable components

### Button
`src/components/ui/button.tsx`

Use `<Button>` rather than recreating buttons. Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`. Sizes: `default`, `sm`, `lg`, `icon`. The base has rounded-md, 44px-ish focus/interaction behavior, and accessible focus rings.

### Card
`src/components/ui/card.tsx`

Use `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, and `CardAction`. Base Card styling is `bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm`.

### Customize sidebar
`src/components/app-sidebar.tsx`

`AppSidebar` is a client component containing `FontSelector` and a Slider. It applies selected background/text colors and letter spacing directly to `document.body`, and adds the selected font's generated class to `document.body`. Current spacing range is 2–5px in 0.1px steps. Default background is `#FFF3CE`; default text is `#020402`; default letter spacing is 2px.

### Font selector
`src/components/ui/fontSelector.tsx`

A Radix Popover + Command combobox using the shared `Button` with `variant="outline"`. Reuse this pattern for searchable option selection.

### LexiMate step cards
`ReadHear`, `PracticeStep`, and `TrackStep` use `Card` with `border-2 bg-[#FFFAEF] text-[#020402]`, headings at `text-2xl sm:text-3xl`, and 44px minimum interactive controls.

## Layout wrappers

- Home (`src/app/page.tsx`): `flex flex-col items-center min-h-screen w-full max-w-full overflow-x-hidden p-4`; content uses centered flex columns and `py-16`.
- Upload (`src/app/upload/page.tsx`): `flex justify-center items-center w-full h-screen`; the main card is `w-2/3 h-2/3 border-2 bg-[#FFFAEF] text-[#020402]`.
- Root layout (`src/app/layout.tsx`) wraps every page in `SidebarProvider`, renders `AppSidebar`, `SidebarTrigger`, page children, and Vercel Analytics.

## Personalization UI reuse

The LexiMate personalization quiz introduced in Stage 1 reuses the existing `Card` and `Button` primitives, the existing warm palette (`#FFFAEF`, `#020402`, `orange-200`, `yellow-200`, `green-200`), Tailwind default spacing, and the existing 44px minimum interaction target. Quiz cards are capped at `max-w-2xl` and centered so they remain readable on desktop while preserving comfortable mobile tap targets.
