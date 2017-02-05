
const EMPTY = {};

export function match(url, route) {
	let reg = /^([^?]*)(?:\?([^#]*))?(#.*)?$/,
		[, pathname, search] = (url.match(reg) || []);
	return exec(segmentize(pathname || ''), route);
}

export function exec(url, route, opts=EMPTY) {
	let matches = {},
		ret;
	route = segmentize(route || '');
	let max = Math.max(url.length, route.length);
	for (let i=0; i<max; i++) {
		if (route[i] && route[i].charAt(0)===':') {
			let [, param, flags] = /^:(.*?)([+*?]*)$/.exec(route[i]),
				plus = ~flags.indexOf('+'),
				star = ~flags.indexOf('*'),
				val = url[i] || '';
			if (!val && !star && (flags.indexOf('?')<0 || plus)) {
				ret = false;
				break;
			}
			else if (plus || star) {
				matches[param] = decodeURIComponent(url.slice(i).join('/'));
				break;
			}
			matches[param] = decodeURIComponent(val);
		}
		else if (route[i]!==url[i]) {
			ret = false;
			break;
		}
	}
	if (opts.default!==true && ret===false) return false;
	return matches;
}

export function pathRankSort(a, b) {
	let aAttr = a.attributes || EMPTY,
		bAttr = b.attributes || EMPTY;
	if (aAttr.default) return 1;
	if (bAttr.default) return -1;
	let aRank = rank(aAttr.path),
		bRank = rank(bAttr.path);
	return (aRank < bRank) ? 1 :
		(aRank == bRank) ? 0 :
		-1;
}

export function segmentize(url) {
	return strip(url).split('/');
}

export const rankSegment = (segment) => {
	let [, isParam, , flag] = /^(:?)(.*?)([*+?]?)$/.exec(segment);
	return String(isParam ? ('0*+?'.indexOf(flag) || 4) : 5);
};

export const rank = (path) => (
	segmentize(path).map(rankSegment).join('')
);

export function rankChild({ attributes=EMPTY }) {
	return attributes.default ? '0' : rank(attributes.path);
}

export function strip(url) {
	return url.replace(/(^\/+|\/+$)/g, '');
}

const $query = (search) => {
	return !search ? EMPTY :
		search.split('&')
			.reduce(($query, parameter) => {
				let [name, ...value] = parameter.split('=');
				$query[decodeURIComponent(name)] = decodeURIComponent(value.join('='));

				return $query
			}, {});

};

export function prepare(url) {
	let reg = /^([^?]*)(?:\?([^#]*))?(#.*)?$/,
		[, pathname, search] = (url.match(reg) || []),
		urlSegments = segmentize(pathname || '');
	return {
		urlSegments,
		$query: () => (search ? $query(search) : EMPTY)
	};
}
