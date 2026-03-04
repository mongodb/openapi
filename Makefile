# A Self-Documenting Makefile: http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html


.PHONY: setup-foascli
setup-foascli:
	pushd tools/cli/ && make setup build  && popd


.PHONY: setup-spectral
setup-spectral:
	pushd tools/spectral/ && make setup  && popd





