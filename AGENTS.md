<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use the public.products catalog with database-enforced is_store_admin() writes; legacy laptops is retired so the store has one authoritative three-field product model.
- Share product query keys and realtime invalidation between storefront and administration, with periodic refetch as a connectivity fallback, so catalog changes propagate across sessions.
- Render product text through React text nodes, never HTML, and validate form input against productSchema so descriptions remain safe and bounded.
