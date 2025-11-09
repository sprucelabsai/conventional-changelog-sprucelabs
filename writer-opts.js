"use strict";

const compareFunc = require(`compare-func`);
const readFile = require(`fs`).readFileSync;
const writerOpts = getWriterOpts();
writerOpts.mainTemplate = readFile(__dirname + `/templates/template.hbs`, `utf8`);
writerOpts.headerPartial = readFile(__dirname + `/templates/header.hbs`, `utf8`);
writerOpts.commitPartial = readFile(__dirname + `/templates/commit.hbs`, `utf8`);
writerOpts.footerPartial = readFile(__dirname + `/templates/footer.hbs`, `utf8`);

module.exports = writerOpts;

function getWriterOpts() {
  return {
    transform: (commit, context) => {
      let discard = true;
      const issues = [];

      commit.notes.forEach((note) => {
        note.title = `BREAKING CHANGES`;
        discard = false;
      });

      const type = commit.type ? commit.type.toLowerCase() : "";

      switch (type) {
        case "major":
        case "breaking":
          commit.type = "Breaking Changes";
          break;
        case "minor":
        case "feat":
          commit.type = "Features";
          break;
        case "fix":
          commit.type = "Bug Fixes";
          break;
        case "perf":
          commit.type = "Performance Improvements";
          break;
        case "revert":
          commit.type = "Reverts";
          break;
        case "docs":
          commit.type = "Documentation";
          break;
        case "style":
        case "styles":
          commit.type = "Styles";
          break;
        case "refactor":
        case "refactoring":
          commit.type = "Refactoring";
          break;
        case "test":
        case "testing":
          commit.type = "Testing";
          break;
        case "build":
          commit.type = "Build System";
          break;
        case "ci":
          commit.type = "Continuous Integration";
          break;
        // By default do not use the commit in the changelog
        default:
          return;
      }

      if (commit.scope === `*`) {
        commit.scope = ``;
      }

      if (typeof commit.hash === `string`) {
        commit.hash = commit.hash.substring(0, 7);
      }

      if (typeof commit.subject === `string`) {
        const url = "https://sprucelabsai.atlassian.net/browse/";
        commit.subject = commit.subject.replace(
          /([A-Z]+\-[0-9]+)/g,
          (_, issue) => {
            issues.push(issue);
            return `[${issue}](${url}${issue})`;
          }
        );
        if (context.host) {
          // User URLs.
          commit.subject = commit.subject.replace(
            /\B@([a-z0-9](?:-?[a-z0-9]){0,38})/g,
            `[@$1](${context.host}/$1)`
          );
        }
      }

      // remove references that already appear in the subject
      commit.references = commit.references.filter((reference) => {
        if (issues.indexOf(reference.issue) === -1) {
          return true;
        }

        return false;
      });

      return commit;
    },
    groupBy: `type`,
    commitGroupsSort: `title`,
    commitsSort: [`scope`, `subject`],
    noteGroupsSort: `title`,
    notesSort: compareFunc,
  };
}
