# Change Log
# [0.1.7]
### Changed
- Updated readme

# [0.1.6] - 11-06-2021
### Added
- Using a relative template path. If your path starts with a . it will now resolve that path based on the first workspace you have open. This allows for setting the path on a per-project basis using the .vscode folder and a settings.json.

# [0.1.5] - 31-08-2020
### Fixed
- Pressing escape to cancel the creation of the template no longer creates `undefined`

# [0.1.4] - 28-08-2020
### Changed
- Added .gif to .vscodeignore file to decrease extension size

# [0.1.3] - 27-08-2020
### Added
- Readme demo gif

# [0.1.2] - 27-08-2020
### Added
- Example React component template

### Changed
- Updated readme

## [0.1.1] - 27-08-2020
### Changed
- Improve on the readme instructions, config file is *not* required

## [0.1.0] - 27-08-2020
### Added
- File based template generation with custom parameters

### Removed
- Hard-coded templates

## [0.0.4] - 17-08-2020
### Fixed
- Missing `extends ComponentProps` on state props interface

## [0.0.3] - 17-08-2020
### Added
- Missing index.ts file

## [0.0.2] - 17-08-2020
### Added
- Path indication before creating the component

### Changed
- Removed placeholder changelog content

### Fixed
- Command was missing and therefore did not show up

## [0.0.1]
- Initial release