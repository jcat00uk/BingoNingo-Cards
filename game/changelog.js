window.CHANGELOG = {

  '20260624-171421': {
    changes: [
      { tag: 'fix', text: 'Fix display issues on Tablet screens', editions: 'all' },
      { tag: 'new', text: 'Add TTS speed settings', editions: 'full' },
      { tag: 'new', text: 'Initial public release, thanks for installing, report any bugs via the Play Store App support email', editions: 'all' }
    ]
  },

  '20260602-1714': {
    changes: [
      { tag: 'new', text: 'Keep screen on — prevent your device sleeping during a game. Toggle on the main menu or in the caller settings (⚙).', editions: 'all' },
      { tag: 'new', text: 'Near win text — shows how close the nearest cards are to the current win (e.g. \'2 plyrs: 1 from line\'). Enable in caller settings (⚙), requires AutoCheck.', editions: 'full' },
      { tag: 'update', text: 'Hold to undo — press and hold a marked number on a player card to deselect it, in addition to double-tap.', editions: 'all' },
      { tag: 'new', text: 'Players can enter up to 3 initials on the card selection screen', editions: 'all' },
      { tag: 'new', text: 'Player share code displays initials when set, e.g. ABC-1234-JBC', editions: 'all' },
      { tag: 'new', text: 'QR code and Copy button include player initials (e.g. ABC1234JBC)', editions: 'all' },
      { tag: 'new', text: 'Caller: scanning a player QR code automatically fills in their initials', editions: 'full' },
      { tag: 'new', text: 'Caller: dedicated Initials field next to Player Code entry; auto-jumps after code is complete', editions: 'full' },
      { tag: 'new', text: 'Caller: pasting a full combined code (e.g. ABC1234JBC) auto-splits into code and initials fields', editions: 'full' },
      { tag: 'new', text: 'Caller: player initials shown on cards and in the player list instead of P1, P2', editions: 'full' },
      { tag: 'new', text: 'Caller: player initials shown in the Verify Win popup card header', editions: 'full' },
      { tag: 'fix', text: 'Caller: card result no longer shows redundant card number (e.g. shows \'2 LINES\' not \'2 LINES, CARD 369\')', editions: 'full' },
      { tag: 'fix', text: 'Near win text now reads \'2 cards: 2 from house\' instead of \'2 plyrs\'', editions: 'full' },
      { tag: 'fix', text: 'Holding to paste in the player code input no longer triggers the help popup', editions: 'full' },
      { tag: 'fix', text: 'Player code card tags now scroll horizontally when they overflow on narrow screens', editions: 'full' },
      { tag: 'fix', text: 'Player code input now fills available width on all screen sizes', editions: 'full' }
    ]
  },

  '20260527-0954': {
    changes: [
      { tag: 'fix', text: 'Fixed issue where main menu buttons need 2 button taps to work, when first loading app', editions: 'all' },
      { tag: 'new', text: 'Continuing closed testing, thank you', editions: 'all' },
      { tag: 'new', text: 'Close button (✕) added to the Bingo Caller Select Cards screen — discards any unconfirmed changes and returns to the main screen', editions: 'full' },
      { tag: 'fix', text: 'Confirmed player codes on the Bingo Caller now correctly restore after a page refresh or navigating back to the menu', editions: 'full' },
      { tag: 'fix', text: 'Unconfirmed player codes (added but not confirmed) no longer survive a page refresh, preventing clashes bypassing the duplicate check', editions: 'full' },
      { tag: 'update', text: 'Up to 3 ads can now be shown per 4-hour session (previously 2), giving a more balanced frequency for active players', editions: 'all' },
      { tag: 'fix', text: 'Ad cooldown timer no longer resets after 24 hours of inactivity, so returning players see ads at the correct frequency', editions: 'all' }
    ]
  },

  '20260522-1356': {
    changes: [
      { tag: 'new', text: 'Continuing closed testing, thank you', editions: 'all' },
      { tag: 'update', text: 'Card selection is now a two-step flow: tap Check Cards to show your share code and QR to the caller, then tap Confirm Cards to load your cards', editions: 'all' },
      { tag: 'update', text: 'Share code and QR code moved from the card selection screen into the new Check Cards step, where the QR is shown immediately without an extra tap', editions: 'all' },
      { tag: 'new', text: 'Tap the share code in the Check Cards screen to copy it to the clipboard', editions: 'all' },
      { tag: 'new', text: 'Close button (✕) added to card selection screen — cancels selection and returns to the main screen', editions: 'all' },
      { tag: 'new', text: 'Close button (✕) added to Check Cards screen — returns to card selection without confirming', editions: 'all' },
      { tag: 'fix', text: 'Help popups no longer appear behind modal overlays', editions: 'all' },
      { tag: 'update', text: 'Ad timing improved: the first session start sets the 30-minute timer without showing an ad, giving new players a full first session uninterrupted', editions: 'all' }
    ]
  },

  '20260521-0859': {
    changes: [
      { tag: 'new', text: 'Continuing closed testing, thank you', editions: 'all' },
      { tag: 'fix', text: 'Three-card layout no longer requires scrolling on smaller screen phones', editions: 'all' },
      { tag: 'fix', text: 'Share code on the card selection screen now fits on one line on smaller phones', editions: 'all' },
      { tag: 'new', text: 'Quick Pick section on the card selection screen can now be collapsed using a toggle, and automatically hides when Advanced Selection is turned on', editions: 'all' },
      { tag: 'fix', text: 'Select Cards panel is now taller on smaller phones, showing significantly more cards at once', editions: 'full' }
    ]
  },

  '20260520-1653': {
    changes: [
      { tag: 'new', text: 'Continuing closed testing, thank you', editions: 'all' },
      { tag: 'fix', text: 'fixed when 3 cards are being displayed there a large blank area beneath which makes the page scrollable', editions: 'all' },
      { tag: 'fix', text: 'corrected the first column on player cards was not uniform with the other columns due the width being 1 digit', editions: 'all' },
      { tag: 'update', text: 'Updated Faster,Slower, play,pause buttons so they can be themed', editions: 'full' }
    ]
  },

  '20260519-1809': {
    changes: [
      { tag: 'new', text: 'Update to main Bingo Caller - Closed Testing Continues Thanks', editions: 'all' },
      { tag: 'new', text: 'Auto Call mode — replaces Next button with play/pause/faster/slower controls', editions: 'full' },
      { tag: 'new', text: 'Auto Call speed presets: 2s, 5s, 10s, 20s with progress bar showing time to next number', editions: 'full' },
      { tag: 'new', text: 'Auto Call pauses on win — shows Win! state for 5 seconds then resumes or hard-pauses depending on settings', editions: 'full' },
      { tag: 'new', text: 'Pause on Win toggle: off = 5s timer then auto-resume; on = hard pause until host presses play', editions: 'full' },
      { tag: 'new', text: 'Pause on Win toggle disabled automatically when Confirm Win is off', editions: 'full' },
      { tag: 'new', text: 'Auto Call settings panel in the settings menu with speed and Pause on Win options', editions: 'full' },
      { tag: 'fix', text: 'Auto Call resumes correctly after cancelling the Win! wait state', editions: 'full' },
      { tag: 'fix', text: 'Auto Call timer now credits the 5s win pause against the current interval — faster speeds resume immediately, longer speeds continue mid-interval', editions: 'full' },
      { tag: 'fix', text: 'Auto Call timer no longer skips forward when app returns from background on Android', editions: 'full' },
      { tag: 'update', text: 'Warning shown when 3s Auto Call speed is selected while Bingo Lingo TTS is active, no disables Bingo Lingo', editions: 'full' }
    ]
  },

  '20260518-1516': {
    changes: [
      { tag: 'new', text: 'Print cards with a QR code rear page for duplex printing', editions: 'full' },
      { tag: 'new', text: 'Duplex print hint tells you to flip on long or short edge depending on layout', editions: 'full' },
      { tag: 'new', text: 'Added ads', editions: 'all' },
      { tag: 'new', text: 'Added themes to bingocaller', editions: 'full' },
      { tag: 'update', text: 'Menu buttons and links highlight on hover on desktop', editions: 'all' },
      { tag: 'fix', text: 'Fixed buttons requiring 2 clicks on main menu to activate', editions: 'all' },
      { tag: 'fix', text: 'Fixed some page scaling issues', editions: 'full' },
      { tag: 'fix', text: 'Changelog popup no longer suppressed if changelog.js loads after page ready', editions: 'all' },
      { tag: 'update', text: 'Warning shown when 2s Auto Call speed is selected while Bingo Lingo TTS is active', editions: 'full' }
    ]
  },

  '20260410-0931': {
    changes: [
      { tag: 'update', text: 'Rebranded to BingoNingo', editions: 'all' },
      { tag: 'new', text: 'Added New Style option in Bingo Card', editions: 'all' },
      { tag: 'new', text: 'Add next win text if autocheck enabled', editions: 'full' },
      { tag: 'new', text: 'Added information about selecting cards', editions: 'full' }
    ]
  },

  '20260406-1600': {
    changes: [
      { tag: 'new', text: 'Add inmage to bingocaller start infograpic', editions: 'all' },
      { tag: 'new', text: 'Changelog popup shows on version update with What\'s New entries per edition', editions: 'all' },
      { tag: 'new', text: 'Changelog editor tool for managing changelog.js visually', editions: 'all' },
      { tag: 'new', text: 'Previous versions section in changelog popup — tap to expand', editions: 'all' },
      { tag: 'new', text: 'Add changelog popup to index menu', editions: 'all' },
      { tag: 'new', text: 'Add version history in changelog output', editions: 'all' },
      { tag: 'new', text: 'QR code popup redesigned - cleaner modal with close button', editions: 'all' },
      { tag: 'new', text: 'Start menu now shows a How it works guide', editions: 'all' },
      { tag: 'new', text: 'Start menu shows a live Game in progress indicator', editions: 'all' },
      { tag: 'new', text: 'Subtitles added under each main menu button', editions: 'all' },
      { tag: 'new', text: 'Home icon added to Caller and Player pages for quick navigation', editions: 'all' },
      { tag: 'new', text: 'Start button now shows a confirmation summary before starting', editions: 'full' },
      { tag: 'new', text: 'Start confirmation shows cards selected, AutoCheck, and Confirm Win status', editions: 'full' },
      { tag: 'new', text: 'Start confirmation shows AutoCheck 1st tier selections before starting', editions: 'full' },
      { tag: 'new', text: 'Confirm Win shows as Disabled with reason if overridden by AutoCheck or TTS Win State', editions: 'full' },
      { tag: 'new', text: 'Start confirmation explains Check Card # is available when no cards are loaded', editions: 'full' },
      { tag: 'new', text: 'Android build bat now auto-copies output to the Capacitor www folder', editions: 'full' },
      { tag: 'new', text: 'Keyboard shortcut hints appear on hover in the Caller', editions: 'full' },
      { tag: 'new', text: 'Card search input shows a scrolling hint when idle', editions: 'full' },
      { tag: 'new', text: 'Controller vibrates twice when a win is detected', editions: 'full' },
      { tag: 'fix', text: 'Fix  initial message informing about ? hints, displaying wrong on android', editions: 'all' },
      { tag: 'fix', text: 'Confirm Win now announces the card number alongside the win tier', editions: 'full' },
      { tag: 'fix', text: 'Double-tap toast now correctly reads "Double-tap to deselect"', editions: 'free' },
      { tag: 'fix', text: 'Card tap hint no longer overlaps the number on small screens', editions: 'free' },
      { tag: 'update', text: 'Win type help now activates by pressing anywhere on the win status row', editions: 'full' },
      { tag: 'update', text: 'Sound and Win TTS both default to off on first run', editions: 'full' },
      { tag: 'update', text: 'TTS settings now expand inline when TTS is turned on', editions: 'full' },
      { tag: 'update', text: 'Card order arrows replace drag-to-reorder on the Caller page', editions: 'full' },
      { tag: 'update', text: 'Select Cards renamed to Player Cards & AutoCheck', editions: 'full' }
    ]
  }

};
