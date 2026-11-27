# Zotero-Translator für das AWMF-Leitlinienregister

Ein [Zotero](https://www.zotero.org)-Web-Translator, der Leitlinien aus dem [AWMF-Leitlinienregister](https://register.awmf.org) mit einem Klick auf den Zotero Connector als vollständigen Eintrag speichert.

> **Hinweis:** Dieser Translator wurde mit Hilfe eines KI-Assistenten (Claude) geschrieben und an echten Leitlinien geprüft. Er ist kein offizieller Zotero-Translator und wird nicht vom Zotero-Projekt gepflegt.

## Installation

1. [`AWMF Leitlinienregister.js`](AWMF%20Leitlinienregister.js) herunterladen.
2. Die Datei in den Ordner `translators` des Zotero-Datenverzeichnisses kopieren. Wo der liegt, zeigt Zotero unter *Einstellungen → Erweitert → Dateien und Ordner → Datenverzeichnis*. Üblich sind:
   - Linux / macOS: `~/Zotero/translators`
   - Windows: `C:\Users\<Name>\Zotero\translators`
3. Zotero neu starten.

Für ein Update die Datei einfach ersetzen und Zotero neu starten.

## Benutzung

Die Detailseite einer Leitlinie öffnen, z. B. <https://register.awmf.org/de/leitlinien/detail/020-020>, und auf den Button des Zotero Connectors klicken. Erkennt der Button die Seite nicht sofort, die Seite einmal neu laden.

## Was in Zotero landet

Eintragstyp **Bericht**:

| Zotero-Feld | Inhalt |
|---|---|
| Titel | Leitlinientitel ohne Stufen-Präfix |
| Berichtstyp | Entwicklungsstufe, z. B. `S3-Leitlinie, AWMF-Register-Nr.` |
| Berichtsnummer | Registernummer, z. B. `020-020` oder `nvl-006` |
| Autor | federführende Fachgesellschaft(en) als Körperschaft; bei Nationalen VersorgungsLeitlinien BÄK, KBV und AWMF |
| Mitwirkende | Koordinatorinnen und Koordinatoren, ohne akademische Titel |
| Datum | „Stand“ der Leitlinie |
| Institution / Ort | AWMF, Berlin |
| Extra | `version: …` (wird beim Zitieren genutzt) und „Gültig bis“ |
| Zusammenfassung | „Zielorientierung der Leitlinie“ |
| Tags | Schlüsselwörter aus dem Register |
| Anhang | Link auf die Langfassung (PDF), öffnet im Browser |
| Notiz | beteiligte Fachgesellschaften, Adressaten, Patientenzielgruppe, Versorgungsbereich und Links zu allen weiteren Dokumenten (Leitlinienreport, Kurzfassung, Patienteninformationen …) |

Im Zitat ergibt das z. B. „Behandlung von erwachsenen Patienten mit ambulant erworbener Pneumonie (S3-Leitlinie, AWMF-Register-Nr. 020-020)“.

## Einschränkungen

- Nur **einzelne Detailseiten** werden unterstützt, kein Sammelimport aus der Trefferliste der Suche. Das Register ist eine JavaScript-Anwendung hinter einem Bot-Schutz; Zotero kann die Detailseiten nicht im Hintergrund laden.
- **Kein automatischer PDF-Download:** Seit November 2026 liefert das Register auch die PDFs nur an Browser aus, die den Bot-Check bestanden haben. Zotero kann sie deshalb nicht selbst herunterladen. Der Eintrag bekommt stattdessen einen Link auf die Langfassung; das PDF im Browser öffnen und bei Bedarf von Hand in Zotero ablegen (z. B. per Drag-and-drop auf den Eintrag).
- Die Daten werden aus der angezeigten Seite gelesen. Ändert die AWMF das Seitenlayout, muss der Translator angepasst werden.
- Getestet mit 020-020, 001-012, 048-013, 050-001 und nvl-006 (Stand November 2026).

Fehler oder geänderte Seiten gern als [Issue](../../issues) melden.

## Lizenz

[GNU Affero General Public License v3.0](LICENSE) oder später, wie die Translatoren des Zotero-Projekts.
