# Create a local Node dev environment
#
# Using https://github.com/uniphil/nix-for-devs as starting point

with import <nixpkgs> {};

stdenv.mkDerivation {
    name = "node";
    buildInputs = [
        nodejs-8_x
    ];
    shellHook = ''
        export PATH="$PWD/node_modules/.bin/:$PATH"

	npm install
    '';
}
