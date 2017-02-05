import { exec, match, pathRankSort, segmentize, rank, strip } from 'src/util';

describe('util', () => {
	describe('strip', () => {
		it('should strip preceeding slashes', () => {
			expect(strip('')).to.equal('');
			expect(strip('/')).to.equal('');
			expect(strip('/a')).to.equal('a');
			expect(strip('//a')).to.equal('a');
			expect(strip('//a/')).to.equal('a');
		});

		it('should strip trailing slashes', () => {
			expect(strip('')).to.equal('');
			expect(strip('/')).to.equal('');
			expect(strip('a/')).to.equal('a');
			expect(strip('/a//')).to.equal('a');
		});
	});

	describe('rank', () => {
		it('should return rank of path segments', () => {
			expect(rank('')).to.eql('5');
			expect(rank('/')).to.eql('5');
			expect(rank('//')).to.eql('5');
			expect(rank('a/b/c')).to.eql('555');
			expect(rank('/a/b/c/')).to.eql('555');
			expect(rank('/:a/b?/:c?/:d*/:e+')).to.eql('45312');
		});
	});

	describe('segmentize', () => {
		it('should split path on slashes', () => {
			expect(segmentize('')).to.eql(['']);
			expect(segmentize('/')).to.eql(['']);
			expect(segmentize('//')).to.eql(['']);
			expect(segmentize('a/b/c')).to.eql(['a','b','c']);
			expect(segmentize('/a/b/c/')).to.eql(['a','b','c']);
		});
	});

	describe('pathRankSort', () => {
		it('should sort by highest rank first', () => {
			let paths = arr => arr.map( path => ({attributes:{path}}) );

			expect(
				paths(['/:a*','/a','/:a+','/:a?','/a/:b*']).sort(pathRankSort)
			).to.eql(
				paths(['/a/:b*','/a','/:a?','/:a+','/:a*'])
			);
		});

		it('should return default routes last', () => {
			let paths = arr => arr.map( path => ({attributes:{path}}) );

			let defaultPath = {attributes:{default:true}};
			let p = paths(['/a/b/','/a/b','/','b']);
			p.splice(2,0,defaultPath);

			expect(
				p.sort(pathRankSort)
			).to.eql(
				paths(['/a/b/','/a/b','/','b']).concat(defaultPath)
			);
		});
	});

	describe('match', () => {
		it('should match explicit equality', () => {
			expect(match('/','/')).to.eql({});
			expect(match('/a','/a')).to.eql({});
			expect(match('/a','/b')).to.eql(false);
			expect(match('/a/b','/a/b')).to.eql({});
			expect(match('/a/b','/a/a')).to.eql(false);
			expect(match('/a/b','/b/b')).to.eql(false);
		});

		it('should match param segments', () => {
			expect(match('/', '/:foo')).to.eql(false);
			expect(match('/bar', '/:foo')).to.eql({ foo:'bar' });
		});

		it('should match optional param segments', () => {
			expect(match('/', '/:foo?')).to.eql({ foo:'' });
			expect(match('/bar', '/:foo?')).to.eql({ foo:'bar' });
			expect(match('/', '/:foo?/:bar?')).to.eql({ foo:'', bar:'' });
			expect(match('/bar', '/:foo?/:bar?')).to.eql({ foo:'bar', bar:'' });
			expect(match('/bar', '/:foo?/bar')).to.eql(false);
			expect(match('/foo/bar', '/:foo?/bar')).to.eql({ foo:'foo' });
		});

		it('should match splat param segments', () => {
			expect(match('/', '/:foo*')).to.eql({ foo:'' });
			expect(match('/a', '/:foo*')).to.eql({ foo:'a' });
			expect(match('/a/b', '/:foo*')).to.eql({ foo:'a/b' });
			expect(match('/a/b/c', '/:foo*')).to.eql({ foo:'a/b/c' });
		});

		it('should match required splat param segments', () => {
			expect(match('/', '/:foo+')).to.eql(false);
			expect(match('/a', '/:foo+')).to.eql({ foo:'a' });
			expect(match('/a/b', '/:foo+')).to.eql({ foo:'a/b' });
			expect(match('/a/b/c', '/:foo+')).to.eql({ foo:'a/b/c' });
		});

		// it('should handle query-string', () => {
		// 	expect(match('/?foo=bar', '/')).to.eql({ foo: 'bar' });
		// 	expect(match('/a?foo=bar', '/:foo')).to.eql({ foo: 'a' });
		// });
	});
});
