'use strict'

const parserOpts = require(`./parser-opts`)

module.exports = {
	parserOpts,

	whatBump: commits => {
		// level 0 = major
		// level 0 = minor
		// level 2 = patch

		let level = 2
		let patch = 0
		let minor = 0
		let major = 0

		commits.forEach(commit => {
			switch (commit.type) {
				case 'BREAKING':
				case 'breaking':
				case 'major':
					major += 1
					level = 0
					break
				case 'minor':
				case 'feat':
					minor += 1
					if (level === 2) {
						level = 1
					}
					break
				default:
					patch += 1
					break
			}
		})

		return {
			level: level,
			reason: `Major: ${major} | Minor: ${minor} | Patch: ${patch}`
		}
	}
}
