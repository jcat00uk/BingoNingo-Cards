/* =============================================
   BingoNingo Help System — help-content.js
   All feature descriptions for the help popup.

   Each entry:
     title  : string — displayed in popup header
     body   : string | string[] — paragraph(s) of explanation
     list   : string[] (optional) — bullet points after body
     image  : string (optional) — filename inside help/images/
   ============================================= */

window.helpContent = {

  /* ============================================================
     BINGO CALLER (Bingocaller.html)
     ============================================================ */

  caller_player_cards: {
    title: 'Player Cards',
    body: [
      'Opens the <strong>Select Cards</strong> panel where you can load player cards into AutoCheck.',
      'Use the <strong>Player codes</strong> section to add players by their share code (e.g. K4T-2BXQ). Tap <strong>+ Add</strong> or scan their QR code with the camera button. Their cards are automatically selected and locked.',
      'If two players share the same card, both entries turn red and a clash warning appears.',
      'You can also manually select cards from the list for physical card holders.'
    ],
    image: 'share-code-flow.png'
  },

  caller_confirm_win: {
    title: 'Confirm Win',
    body: [
      'When enabled, AutoCheck will <strong>not</strong> immediately announce a win. Instead, a pulsing <strong>Confirm Win</strong> button appears in the bottom row when a winning card is detected.',
      'This gives you time to verify the player\'s card before the win animation fires. Tap <strong>Confirm Win</strong> to accept it.',
      'If <strong>Next</strong> is pressed before confirming, the win opportunity expires silently — the game continues without announcing a win.',
      'Confirm Win is disabled automatically when <strong>TTS Win State</strong> is active, since TTS handles the win announcement instead.'
    ],
	image: 'confirm-win.png'
  },

  caller_autocheck: {
    title: 'AutoCheck',
    body: [
      'AutoCheck automatically checks all loaded player cards against every number that is called.',
      'When a winning pattern is detected — a line, two lines, or full house — the matching numbers highlight yellow on the bingo grid, and the win is announced (or queued for confirmation).',
      'AutoCheck is <strong>locked once a game starts</strong> — it cannot be toggled mid-game.',
      'Requires player cards to be loaded via the <strong>Player Cards</strong> button before starting.'
    ],
    image: 'autocheck-flow.png'
  },

  caller_autocheck_1st: {
    title: 'AutoCheck 1st',
    body: [
      'Controls which win types AutoCheck watches for <strong>first</strong> in a game.',
      'You can enable any combination of <strong>Line</strong>, <strong>2 Lines</strong>, and <strong>Full House</strong>.',
      'Once the first win of a selected type is confirmed, AutoCheck continues watching for the next enabled tier.',
      'Example: with Line + Full House selected, the game detects the first Line win, then moves on to watch for Full House.'
    ],
    image: 'autocheck-first.png'
  },

  caller_player_codes: {
    title: 'Player Codes',
    body: [
      'The Player Codes section lets you load cards directly from players using their <strong>share code</strong>.',
      'Each player opens the BingoNingo Player Cards app, picks their cards, and shares their unique code with you. Enter it here or scan their QR code.',
      'Loaded player cards are <strong>automatically selected and locked</strong> — they cannot be deselected individually, only by removing that player entry.',
      'If two players have the same card in common, a clash warning appears and both entries are highlighted in red.'
    ],
    image: 'share-code-flow.png'
  },

  caller_filter_cards: {
    title: 'Filter Cards',
    body: [
      'Type a card number to filter the card list below.',
      'Useful for quickly finding and selecting a specific card — for example, a physical card handed to a player at an event.',
      'Only accepts numbers. The list updates instantly as you type.'
    ],
    image: 'filter-cards.png'
  },

  caller_tts_settings: {
    title: 'TTS Settings',
    body: [
      'Controls what the Text-to-speech voice reads aloud when a number is called.',
      'You can enable or disable three items independently:',
    ],
    list: [
      '<strong>Number</strong> — speaks the called number in the UK bingo style (e.g. "eight and two, eighty-eight")',
      '<strong>Bingo Lingo</strong> — speaks the traditional nickname for the number',
      '<strong>Win State</strong> — announces the win type and card number when a win is detected (e.g. "Line, Card 42")'
    ],
    // IMAGE SUGGESTION: a screenshot or diagram showing the TTS items list with up/down arrows
    image: 'tts-settings.png'
  },

  caller_sound: {
    title: 'Sound',
    body: [
      'Toggles the <strong>ding</strong> sound effect that plays each time a number is called.',
      'Sound is off by default. Your preference is saved automatically.'
    ]
  },

  caller_tts: {
    title: 'Text-to-speech',
    body: [
      'When enabled, BingoNingo reads each called number aloud using your device\'s built-in speech engine.',
      'Use <strong>TTS Settings</strong> (the row below) to control which items are spoken and in what order.',
      'On Android, the UK English voice is used if available.'
    ]
  },

caller_start: {
    title: 'Start',
    body: [
      'Starts a new game. A confirmation screen appears first, summarising your current setup — cards selected, AutoCheck status, AutoCheck 1st tiers, and Confirm Win status.',
      'Once started, <strong>AutoCheck</strong> and the loaded player cards are locked for the duration.',
      'The number grid resets and the called numbers strip clears.',
      'Keyboard shortcut: <strong>S</strong>'
    ],
    image: 'bingo-start.png'
  },

  caller_end: {
    title: 'End Game',
    body: [
      'Ends the current game and resets everything — called numbers, win states, and loaded player cards are all cleared.',
      'You will be prompted to confirm before the game ends.',
      'Keyboard shortcut: <strong>E</strong>'
    ]
  },

  caller_next: {
    title: 'Next',
    body: [
      'Calls the next random number from the remaining pool.',
      'Numbers are drawn without replacement — each number can only be called once per game.',
      'If <strong>Confirm Win</strong> is active and a win is pending, pressing Next will let the win expire without confirming it.',
      'Keyboard shortcut: <strong>Space</strong>'
    ]
  },

  caller_undo: {
    title: 'Undo',
    body: [
      'Reverses the last called number, removing it from the called list and returning it to the pool.',
      'Any win that was triggered or confirmed on that number is also rolled back — win flags, animations, and AutoCheck state all revert.',
      'You can undo multiple times to step back through the call history.',
      'Keyboard shortcut: <strong>U</strong>'
    ]
  },

  caller_check_card: {
    title: 'Check Card #',
    body: [
      'Type a card number to look up a specific card during a game.',
      'The card\'s numbers highlight in yellow on the bingo grid, showing which have been called and which are still outstanding.',
      'The win status of that card is also shown — useful for verifying a player\'s claim.'
    ],
    image: 'check-card.png'
  },

  caller_win_types: {
    title: 'Win Types',
    body: [
      'BingoNingo supports three win tiers:',
    ],
    list: [
      '<strong>Line</strong> — any complete horizontal row of 5 numbers on a card',
      '<strong>2 Lines</strong> — any two complete rows on the same card',
      '<strong>Full House</strong> — all 15 numbers on a card called'
    ],
    image: 'win-types.png'
  },


  /* ============================================================
     PLAYER CARDS (playgame.html)
     ============================================================ */

  player_new_game: {
    title: 'New Game',
    body: [
      'Starts a new game session. This reveals the card selection area where you can choose your cards.',
      'Any previously loaded cards are cleared. Steps 1–4 are shown on screen to guide you through setup.'
    ]
  },

  player_end_game: {
    title: 'End Game',
    body: [
      'Ends your current game and clears all your cards and progress.',
      'Use this when the caller announces the game is over, or if you want to start fresh with different cards.'
    ]
  },

  player_quick_pick: {
    title: 'Quick Pick',
    body: [
      'Instantly selects 1, 2, or 3 cards at random for you.',
      '<strong>Quick Pick 2</strong> and <strong>Quick Pick 3</strong> are guaranteed to select cards with <strong>no shared numbers</strong> between them — so you\'ll never mark the same number on two cards at once.',
      'The reset (↺) button clears your current selection so you can start again.',
      'Quick Pick 2 and 3 are disabled in Big Card Mode.'
    ],
    image: 'quick-pick.png'
  },

  player_share_code: {
    title: 'Your Share Code',
    body: [
      'Your share code is a unique code that identifies your selected cards.',
      '<strong>Tap it to copy</strong>, then give it to your caller. They enter it into the Player Codes section of BingoNingo Caller to load your cards into AutoCheck.',
      'Alternatively, the caller can scan your QR code directly using the scan button in the Caller app.',
      'Your share code changes each time you pick different cards.'
    ],
    image: 'share-code-flow.png'
  },

  player_big_card_mode: {
    title: 'Big Card Mode',
    body: [
      'Locks you to a single large card displayed in <strong>landscape orientation</strong>, making numbers easier to read — ideal for players who prefer a larger view.',
      'Only 1 card can be selected in Big Card Mode. Quick Pick 2 and 3 are disabled.',
      'The screen switches to landscape automatically when you tap <strong>Confirm Selection</strong>.',
      'Enable this <strong>before</strong> selecting your card.'
    ],
    image: 'big-card.png'
  },

  player_advanced_selection: {
    title: 'Advanced Selection',
    body: [
      'Shows the full list of available cards so you can browse and pick manually.',
      'Cards are sorted by how many numbers they share with your current selection — cards with fewer shared numbers appear first.',
      'Cards with <strong>6 or more shared numbers</strong> are greyed out and cannot be selected.',
      'Cards with some overlap show an amber <strong>X shared</strong> label — you can still select these, but those numbers will be marked on multiple cards simultaneously when called.'
    ],
    image: 'Advanced-Selection.png'
  },

  player_confirm_selection: {
    title: 'Confirm Selection',
    body: [
      'Locks in your chosen cards and starts your playing session.',
      'Once confirmed, your share code is finalised and can be given to the caller.',
      'You cannot change your cards after confirming without starting a new game.'
    ]
  },

  player_qr_code: {
    title: 'QR Code Button',
    body: [
      'Shows a fullscreen QR code containing your share code.',
      'Your caller can scan this directly using the camera button in the BingoNingo Caller app — no typing needed.',
      'The QR button is greyed out until you have confirmed your card selection.'
    ],
    image: 'QR-Code.png'
  },

  player_theme: {
    title: 'Card Theme',
    body: [
      'Lets you customise the look of your bingo cards.',
      'Choose from presets (Dark, Ocean Night, Forest, Gold Rush, Purple Haze) or set individual colours for the card background, number text, called number highlight, and card title.',
      'Tap <strong>Save theme</strong> to keep your chosen colours across sessions.'
    ],
    image: 'Card-Theme.png'
  },


  /* ============================================================
     PRINT CARDS (printCards.html)
     ============================================================ */

  print_card_layout: {
    title: 'Card Layout',
    body: [
      'Controls how many cards are printed per A4 page.',
    ],
    list: [
      '<strong>1×2</strong> — 2 large cards per page, best for players who need bigger text',
      '<strong>2×3</strong> — 6 cards per page, good for small groups',
      '<strong>2×5</strong> — 10 cards per page, portrait orientation',
      '<strong>3×4</strong> — 12 cards per page, good all-rounder',
      '<strong>4×5</strong> — 20 cards per page, best for large events'
    ],
    body2: 'In <strong>Random with Share Codes</strong> mode, cards are printed in pairs. Each pair is grouped with a share code above it so players can load both cards into the BingoNingo app.',
	image: 'print-card-layout.png'
  },

  print_order: {
    title: 'Order',
    body: [
      'Controls how cards are arranged across the printed pages.',
    ],
    list: [
      '<strong>Random with Share Codes</strong> — cards are paired randomly, each pair sharing as few numbers as possible. A share code is printed above each pair. Recommended for events where players will use the BingoNingo app.',
      '<strong>Random</strong> — cards in random order with no grouping or share codes. Good for purely physical play.',
      '<strong>Sequential</strong> — cards printed in numeric order (Card 1, Card 2, …). Choose a page range to print a subset.'
    ],
	image: 'print-card-order.png'
  },

  print_style: {
    title: 'Style',
    body: [
      'Changes the visual theme of the printed cards.',
      'Options include Plain, Christmas, Easter, Neon, Halloween, Retro, Gold, Kids, Minimal, and Casino.',
      'A preview is shown on screen before you download. The final PDF may differ slightly in size and spacing from the preview.'
    ],
	image: 'print-card-style.png'
  },

  print_duplex_qr: {
    title: 'Add QR Rear Page (Duplex)',
    body: [
      'When enabled, a <strong>rear page</strong> is added after every card sheet in the PDF — designed for duplex (double-sided) printing.',
      'Each cell on the rear page contains a QR code and card number, precisely aligned so after a standard long-edge flip, each QR lands directly behind its card.',
      'Players or the caller can scan the QR code to instantly load that card in the BingoNingo app.',
      'In <strong>Random with Share Codes</strong> mode, a group QR badge also appears in the gutter between each pair of cards — scanning it loads both cards at once.'
    ]
  },

  print_download: {
    title: 'Download PDF',
    body: [
      'Generates and downloads the bingo cards as an A4 PDF file.',
      'On Android, the share sheet opens so you can save to Downloads, send via email, print directly, or share to another app.',
      'In a web browser, the PDF downloads automatically.',
      'The number of pages downloaded depends on the <strong>Number of Pages</strong> or <strong>Page Range</strong> setting.'
    ]
  },

  caller_customise_themes: {
    title: 'Customise Themes',
    body: [
      'Expand this section to edit individual colours for every element of the app\'s UI. Changes apply live so you can see them instantly.',
      'Tap any <strong>colour circle</strong> to open the colour picker for that element. Drag to choose a colour — the app updates behind it in real time. Press <strong>Cancel</strong> to revert or <strong>Apply</strong> to keep the change.',
      'Tap any <strong>label name</strong> to flash the affected elements on screen so you can identify what that variable controls before opening the picker.',
      'Use the <strong>Save</strong> button to store your current colours as a named theme — it will appear in the preset list above.',
      'Use <strong>Import/Export</strong> to back up your theme as a JSON file or share it between devices.'
    ]
  },

  caller_themes: {
    title: 'Themes',
    body: [
      'The Themes section lets you change the colour scheme of the entire app.',
      'Choose from the built-in presets — tap any preset to apply it instantly and see the changes live.',
      'Tap <strong>Customise Theme</strong> to expand the colour editor. Tap any colour circle to open the colour picker — the app updates live behind it as you drag. Press <strong>Cancel</strong> to revert to the previous colour or <strong>Apply</strong> to keep it.',
      'Tap <strong>Save</strong> to store your current colours as a named theme. Saved themes appear in the preset list and can be deleted with the <strong>✕</strong> button next to them.',
      'Use <strong>Imp / Exp</strong> to export your current theme as JSON for backup or to share with others, or paste JSON to import a theme. Your last used theme is remembered between sessions.'
    ]
  },

  caller_remove_ads: {
    title: 'Remove Ads',
    body: [
      'Removes all adverts from the app with a one-time purchase.',
      'Tap <strong>Remove Ads</strong> to begin the purchase through the Google Play Store. You will not be charged more than once for the same purchase.',
      'If you have already purchased on this account or a previous device, tap <strong>Restore</strong> to reinstate it without being charged again.',
      'Purchases are tied to your Google Play account and can be restored on any device signed in to the same account.'
    ]
  }

};
