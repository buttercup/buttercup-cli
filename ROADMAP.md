1. Design the API and stub out all of the minimally needed commands
2. implement the API

INITCONFIG
  - [x] should look for a config and make one in the os.homedir().

CONFIG:
  - [] this should search all the os homedir for a standard file

COPY
  - [] should have an option to copy the different fields of the secret

LOCK/UNLOCK
  - [] should lock and unlock with names instead of UUIDs. Or the UUIDs should be converted to something manageable and
   used alongside the name

NEW
  - [] should have stdin prompts like this https://github.com/buttercup/buttercup-cli/pull/19#discussion_r245375116

LS
  - [] decide how the ls will work? will it work like POSIX ls or have a bunch of options for output

SHOW
  - [] tab completion completes what can be shown
