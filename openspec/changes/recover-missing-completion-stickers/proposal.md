## Why

The move to file-backed generated images exposed that saved completion sticker files can be deleted independently from the completion records in SQL. When that happens, the history and weekly sticker views lose their saved artwork even though the completion events, prompts, and themes still exist.

## What Changes

- add a supported recovery path that regenerates missing completion sticker images from persisted completion records
- prefer regenerating from the saved completion prompt when one exists so recovered stickers stay as close as possible to the original intent
- fall back to rebuilding the completion image request from the current child profile and activity metadata when no saved prompt exists
- add a runnable recovery script for local SQL-backed environments

## Impact

- restores missing saved sticker artwork without rewriting completions manually
- preserves SQL as the single source of truth while repopulating the managed generated asset directory
- does not recover the exact deleted image bytes; it regenerates replacement sticker artwork
