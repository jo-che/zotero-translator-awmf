{
	"translatorID": "87a869eb-6c33-4ab9-9fae-a3eaafb03cb7",
	"label": "AWMF Leitlinienregister",
	"creator": "jo-che",
	"target": "^https?://register\\.awmf\\.org/(de|en)/leitlinien/detail/",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": false,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2026-11-27 10:51:22"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2026 jo-che

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/

/*
	This translator was written with the help of an AI assistant (Claude).

	Saves guideline detail pages of the AWMF guideline register
	(https://register.awmf.org/de/leitlinien/detail/<Registernummer>) as reports.

	The register is a single-page app behind a bot check, so only the rendered
	detail page of the open browser tab can be translated (no multiples).
*/

function detectWeb(doc, _url) {
	if (getDetails(doc)) {
		return 'report';
	}
	Z.monitorDOMChanges(doc.body);
	return false;
}

function doWeb(doc, url) {
	scrape(doc, url);
}

function scrape(doc, url) {
	let details = getDetails(doc);
	let rows = getRows(details);
	let item = new Zotero.Item('report');

	let registerNumber = '';
	let m = url.match(/\/detail\/([\w-]+)/);
	if (m) {
		registerNumber = m[1];
	}
	else {
		let card = details.closest('ion-card-content') || doc;
		let regHeading = Array.from(card.querySelectorAll('h3'))
			.map(h => h.textContent)
			.find(t => /Registernummer/i.test(t));
		if (regHeading) {
			registerNumber = regHeading.replace(/^.*Registernummer\s*/i, '').replace(/\s+/g, '');
		}
	}

	let fullTitle = ZU.trimInternal(text(details, 'h1'));
	let stage = fullTitle.match(/^(S[123][ek]?|S2[ek]|NVL|NVL-?\s?Programm)\b-?\s*Leitlinie\s+/i);
	if (stage) {
		item.title = fullTitle.slice(stage[0].length);
		item.reportType = stage[0].trim() + ', AWMF-Register-Nr.';
	}
	else {
		item.title = fullTitle;
		item.reportType = 'Leitlinie, AWMF-Register-Nr.';
	}
	item.reportNumber = registerNumber;

	let stand = rowText(rows, /^Stand/);
	if (stand) item.date = ZU.strToISO(stand);

	item.institution = 'Arbeitsgemeinschaft der Wissenschaftlichen Medizinischen Fachgesellschaften (AWMF)';
	item.place = 'Berlin';
	item.language = 'de';
	item.url = 'https://register.awmf.org/de/leitlinien/detail/' + registerNumber;
	item.libraryCatalog = 'AWMF Leitlinienregister';

	let extra = [];
	let version = rowText(rows, /^Version/);
	if (version) extra.push('version: ' + version);
	let validUntil = rowText(rows, /^Gültig bis/);
	if (validUntil) extra.push('Gültig bis: ' + validUntil);
	if (extra.length) item.extra = extra.join('\n');

	let leading = societies(rows, /^Federführende Fachgesellschaft/);
	let authors = leading;
	// NVL guidelines list the programme itself as leading society; its official authors are the three sponsors.
	if (leading.length == 1 && /^NVL-Programm$/i.test(leading[0])) {
		authors = [
			'Bundesärztekammer (BÄK)',
			'Kassenärztliche Bundesvereinigung (KBV)',
			'Arbeitsgemeinschaft der Wissenschaftlichen Medizinischen Fachgesellschaften (AWMF)',
		];
	}
	for (let name of authors) {
		item.creators.push({ lastName: name, creatorType: 'author', fieldMode: 1 });
	}
	for (let name of coordinators(rows)) {
		item.creators.push(ZU.cleanAuthor(name, 'contributor'));
	}

	let abstract = rowText(rows, /^Zielorientierung/);
	if (abstract) item.abstractNote = abstract;

	for (let kw of keywordList(rows)) {
		item.tags.push(kw);
	}

	let docs = getDocuments(details);
	let main = docs.find(d => /^Langfassung/i.test(d.title))
		|| docs.find(d => /Leitlinie/i.test(d.title))
		|| docs[0];
	// The register serves its PDFs only to browsers that passed its bot check, so Zotero
	// cannot download them itself. A link attachment opens the PDF in the browser instead.
	if (main) {
		item.attachments.push({
			url: main.url,
			title: 'Langfassung (PDF, im Browser öffnen)',
			mimeType: 'application/pdf',
			snapshot: false,
		});
	}

	let note = buildNote(rows, leading, docs);
	if (note) item.notes.push({ note: note });

	item.complete();
}

function getDetails(doc) {
	let pages = Array.from(doc.querySelectorAll('app-detail'))
		.filter(p => !p.classList.contains('ion-page-hidden'));
	for (let page of pages.reverse()) {
		let details = page.querySelector('.guideline-details');
		if (details && details.querySelector('h1')) return details;
	}
	return null;
}

function getRows(details) {
	return Array.from(details.querySelectorAll('ion-row'))
		.filter(r => r.children.length >= 2 && !r.closest('.document-list'))
		.map(r => ({ label: ZU.trimInternal(r.children[0].textContent), cell: r.children[1] }));
}

function rowCells(rows, labelRe) {
	return rows.filter(r => labelRe.test(r.label)).map(r => r.cell);
}

function rowText(rows, labelRe) {
	let cell = rowCells(rows, labelRe)[0];
	return cell ? ZU.trimInternal(cell.textContent) : '';
}

function societies(rows, labelRe) {
	let names = [];
	for (let cell of rowCells(rows, labelRe)) {
		let labels = cell.querySelectorAll('ion-label');
		let parts = labels.length
			? Array.from(labels).map(l => l.textContent)
			: cell.textContent.split(/\(Visitenkarte\)/);
		for (let part of parts) {
			let name = ZU.trimInternal(part.replace(/\(Visitenkarte\)/g, ''));
			if (name && !names.includes(name)) names.push(name);
		}
	}
	return names;
}

function keywordList(rows) {
	let tags = [];
	let seen = [];
	for (let cell of rowCells(rows, /^Schlüsselwörter/)) {
		// Lines are separated by <br>; a line may start with a language label such as "Englisch:".
		let lines = cell.innerHTML.split(/<br\s*\/?>/i).map(l => ZU.unescapeHTML(l.replace(/<[^>]+>/g, '')));
		for (let line of lines) {
			line = ZU.trimInternal(line).replace(/^(Englisch|English|Deutsch|German)\s*:\s*/i, '');
			for (let kw of line.split(/\s*[,;]\s*/)) {
				kw = ZU.trimInternal(kw);
				if (kw && !seen.includes(kw.toLowerCase())) {
					seen.push(kw.toLowerCase());
					tags.push(kw);
				}
			}
		}
	}
	return tags;
}

function coordinators(rows) {
	let names = [];
	for (let cell of rowCells(rows, /^Koordination/)) {
		let bold = cell.querySelectorAll('b, strong');
		let lines;
		if (bold.length) {
			lines = Array.from(bold).map(b => b.textContent);
		}
		else {
			// Without bold names the cell holds a plain name list separated by <br>.
			let block = cell.querySelector('div') || cell;
			lines = block.innerHTML.split(/<br\s*\/?>/i).map(l => l.replace(/<[^>]+>/g, ''));
		}
		for (let line of lines) {
			let name = cleanName(line);
			if (name && !/\d|@/.test(name) && name.split(' ').length >= 2 && name.split(' ').length <= 5 &&!names.includes(name)) {
				names.push(name);
			}
		}
	}
	return names;
}

function cleanName(name) {
	return ZU.trimInternal(name)
		.replace(/\b(Univ\.-)?(Prof|Dr|PD|Priv\.-Doz|Doz|Dipl\.-\w+|med|rer\. nat|phil|habil|MSc|MPH|PhD|MME)\.?(?=\s|$)/gi, '')
		.replace(/\b(dent|nat|rer|sc|hum)\.\s*/gi, '')
		.replace(/,\s*$/, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function buildNote(rows, leading, docs) {
	let fields = [
		['Federführende Fachgesellschaft(en)', leading.join('; ')],
		['Beteiligte AWMF-Fachgesellschaften', societies(rows, /^Beteiligung weiterer AWMF/).join('; ')],
		['Weitere beteiligte Organisationen', societies(rows, /^Beteiligung weiterer Fachgesellschaften/).join('; ')],
		['Adressaten', rowText(rows, /^Adressaten/)],
		['Patientenzielgruppe', rowText(rows, /^Patientenzielgruppe/)],
		['Versorgungsbereich', rowText(rows, /^Versorgungsbereich/)],
		['Gültig bis', rowText(rows, /^Gültig bis/)],
	];
	let html = fields
		.filter(f => f[1])
		.map(f => '<p><strong>' + f[0] + ':</strong> ' + escapeHTML(f[1]) + '</p>')
		.join('\n');
	if (docs.length) {
		html += '\n<p><strong>Dokumente:</strong></p>\n<ul>\n'
			+ docs.map(d => '<li><a href="' + escapeHTML(d.url) + '">' + escapeHTML(d.title) + '</a></li>').join('\n')
			+ '\n</ul>';
	}
	return html ? '<h2>AWMF-Registerdaten</h2>\n' + html : '';
}

function getDocuments(details) {
	return Array.from(details.querySelectorAll('.document-list ion-row'))
		.map(r => ({
			title: ZU.trimInternal(r.children[0] ? r.children[0].textContent : ''),
			href: attr(r, 'a[href]', 'href'),
		}))
		.filter(d => d.href && /\.pdf(\?|$)/i.test(d.href))
		.map(d => ({
			title: d.title,
			url: /^https?:/i.test(d.href) ? d.href : 'https://register.awmf.org/' + d.href.replace(/^\/+/, ''),
		}));
}

function escapeHTML(str) {
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** BEGIN TEST CASES **/
var testCases = [
]
/** END TEST CASES **/
