#!/bin/bash

prettier --write "**/*.{ts,mts,js,mjs,cjs,vue,scss}"
eslint --fix "**/*.{ts,mts,js,mjs,cjs,vue}"
stylelint --fix "**/*.scss"
