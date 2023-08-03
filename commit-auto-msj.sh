#!/bin/bash
iso_date=$(date +%F)
commit_count=$(git rev-list --count HEAD)
session_count=$(expr $commit_count + 1)
default_mins=90

msj="session #$session_count, $iso_date, $default_mins min"

git commit -m "$msj"
