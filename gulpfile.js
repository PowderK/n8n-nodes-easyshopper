const { src, dest } = require('gulp');

function build() {
	return src('nodes/**/*.svg')
		.pipe(dest('dist/nodes/'));
}

function buildIcons() {
	return src('nodes/**/*.svg')
		.pipe(dest('dist/nodes/'));
}

exports.default = build;
exports['build:icons'] = buildIcons;