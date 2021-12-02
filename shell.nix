with import <nixpkgs> {}; 

mkShell {
  nativeBuildInputs = with buildPackages; [ 
    nodejs-12_x
  ];
}