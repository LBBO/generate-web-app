# Save any file templates in this folder

These files will probably always be for some extension that wants to create a new file in the target directory. They
can't be stored under src/ because the compiled js files have a **dirname pointing to the wrong location. Moving the
files to a folder outside of src/ and the dist folder having the same structure as src means that the different
**dirname has no effect anymore.
