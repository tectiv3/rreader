{
  description = "rreader dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "aarch64-darwin";
      pkgs = nixpkgs.legacyPackages.${system};

      php = pkgs.php85.buildEnv {
        extensions = { enabled, all }: enabled ++ [
          all.bcmath
          all.gd
          all.intl
          all.mbstring
          all.readline
          all.zip
        ];
        extraConfig = ''
          memory_limit = 512M
          upload_max_filesize = 512M
          post_max_size = 512M
        '';
      };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = [
          php
          php.packages.composer
          pkgs.nodejs
          pkgs.pnpm
          pkgs.overmind
          pkgs.tmux # overmind dependency
        ];

        shellHook = ''
          echo "rreader dev environment ready"
          echo "Run: overmind start"
          echo "Then visit: https://rreader.test"
        '';
      };
    };
}
