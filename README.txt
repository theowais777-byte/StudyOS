StudyOS for Laptops: Task Manager — v2.0 Matte Edition

WHAT'S NEW
- Full redesigned matte charcoal / slate / sage / taupe UI
- Dashboard with task stats and priority task list
- Task manager: subject/category, deadline, priority, search, status and priority filters
- Focus timer: 25-minute focus, 5-minute short break, 15-minute long break
- Quick notes with automatic local saving
- Responsive layout for laptop windows
- Local browser storage; no API keys or paid services required

PRESERVING YOUR EXISTING TASKS
This version deliberately uses the same task storage key as the first starter:
studyos-laptop-tasks-v1
Open v2 in the same Chrome profile on the same Chromebook and existing tasks should appear automatically.

RUN ON CHROMEBOOK
1. Download and extract StudyOS-v2.zip.
2. Open the extracted StudyOS-v2 folder in Files.
3. Right-click the folder and choose Share with Linux.
4. Open Terminal. The exact path depends on where you extracted it. Common example:
   cd /mnt/chromeos/MyFiles/Downloads/StudyOS-v2
5. Start a local server:
   python3 -m http.server 8000
6. In Chrome open http://localhost:8000
7. Keep Terminal open while using the local server. Install from Chrome's menu if Chrome offers the install option.

If the folder path differs, type `ls /mnt/chromeos/MyFiles/Downloads` to see the available folder names.
If you want to test the files directly, open index.html, but PWA installation requires localhost or HTTPS.

DATA / PRIVACY
Tasks, notes, and focus-session count are saved in localStorage on this browser profile. No login or cloud sync is included yet. Clearing Chrome site data can remove local app data. Keep the project files together.


STUDYOS PLUS UPGRADES
- Edit existing tasks with the pencil button.
- Export a JSON backup of tasks, notes, and focus-session count.
- Import a StudyOS JSON backup into this app copy (replaces current local data after confirmation).
- Clear completed tasks with confirmation.
- Still no login, signup, cloud sync, API keys, or paid services.
- Data stays in this browser's local storage for this app origin. Different localhost ports/origins may keep separate data.

THEME UPDATE v2.2
- Warm cream, taupe, and muted brown matte palette.
- Green accents removed; no gradients.
- Local-only data; no login/signup or cloud sync.


Version 2.5: fixed sidebar stays in place while the main page scrolls. Use the small arrow button beside the StudyOS logo to collapse/expand the sidebar; collapsed mode shows icons only.


VERSION 2.7 — PDF READER
- Added PDF Reader in the left navigation.
- Choose a PDF from your device to view it in the browser built-in PDF viewer.
- Files are opened locally using a temporary browser URL; they are not uploaded to a server.
- Browser PDF support is required. Use Open in new tab if the embedded viewer does not appear.
