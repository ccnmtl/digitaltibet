#!/usr/bin/env python3
import os
import toml
import argparse
import urllib.request
import shutil
from subprocess import call


def download_file(url):
    call(['wget', '-q', url])


def main():
    """Download all the images for the content."""
    parser = argparse.ArgumentParser()
    parser.add_argument('objectdir', type=str)
    args = parser.parse_args()

    for filename in os.listdir(args.objectdir):
        path = os.path.join(args.objectdir, filename)
        with open(path) as objfile:
            s = objfile.read().replace('+++', '')
            try:
                obj = toml.loads(s)

                if obj.get('image'):
                    print(obj.get('image'))
                    download_file(obj.get('image'))

                if obj.get('thumbnail'):
                    download_file(obj.get('thumbnail'))
            except Exception as e:
                print(path, e)


if __name__ == "__main__":
    main()
