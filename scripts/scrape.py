#!/usr/bin/env python3
from datetime import datetime
from requests import Session
import os
import re
from bs4 import BeautifulSoup


HOST = "digitaltibet.ccnmtl.columbia.edu"
NUM_PAGES = 18


class Site:
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.session = None

    def url(self):
        return "http://{}/collection/all".format(HOST)

    def login(self):
        self.session = Session()
        # drupal requires that you first GET the form
        r = self.session.get(self.url())
        # then POST to it
        s = self.session.post(
            self.url(), data={
                'name': self.username, 'pass': self.password,
                'form_id': 'user_login',
                'op': 'Log in',
            },
            headers={
                'referer': self.url(),
            }
        )
        print("=== logged in ===")
        return self.session

    def get_session(self):
        if self.session is not None:
            return self.session
        self.session = self.login()
        return self.session

    def get_collection_page(self, page):
        return CollectionPage(self.session, page)


class Fetchable:
    def fetch(self):
        if self.soup is not None:
            return self.soup
        r = self.session.get(self.url())
        self.text = r.text
        self.soup = BeautifulSoup(self.text, "html.parser")
        return self.soup


class CollectionPage(Fetchable):
    def __init__(self, session, pagenum):
        self.session = session
        self.pagenum = pagenum
        self.text = ""
        self.soup = None

    def base_url(self):
        return "http://{}/collection/all".format(HOST)

    def url(self):
        return "{}?page={}".format(self.base_url(), self.pagenum)

    def linked_nodes(self):
        soup = self.fetch()
        for node in soup(class_='node'):
            path = node.find('a').attrs['href']
            try:
                # ntype = td.next_sibling.next_sibling.next_sibling.next_sibling.ul.li.a.string
                yield NodePage(self.session, path)
            except AttributeError:
                pass


def escape(s):
    return s.replace('\'', '\\\'')


class Obj:
    ntype = 'object'

    def __init__(self, path, soup):
        self.path = path
        self.soup = soup

    def as_dict(self):
        return {
            'date': str(datetime.utcnow()),
            'title': self.title(),
            'image': self.image_src(),
            'thumbnail': self.image_preview(),
            'object_use': self.get_field('object_use'),
            'material': self.get_field('material'),
            'date_range': self.get_field('date_range'),
            'size': self.get_field('size'),
            'source_title': self.get_field('source_title'),
            'source_url': self.get_field('source_url'),
            'notes': self.get_field('notes'),
        }

    def as_toml(self):
        import toml
        d = self.as_dict()
        s = "+++\n" + toml.dumps(d) + "\n+++\n"
        return s.replace('\n\n', '\n')

    def as_yaml(self):
        import ruamel.yaml
        d = self.as_dict()
        s = "---\n" + \
            ruamel.yaml.dump(d, Dumper=ruamel.yaml.RoundTripDumper) + \
            "\n---\n"
        return s.replace('\n\n', '\n')

    def local_path(self):
        return "content/{}/{}.md".format(self.ntype, self.basename())

    def basename(self):
        return os.path.basename(self.path).replace('%', '')

    def title(self):
        m = re.match(r'^((\w|\s)*) \| .*$', self.soup.title.string)
        if m:
            title = m.group(1)
            return title
        else:
            return self.soup.title.string

    def get_field(self, fieldname):
        content = self.soup.find(class_='node')
        labels = content.find_all(class_='field-label')
        field = None
        for label in labels:
            stripped_label = label.string.strip().lower()
            stripped_label = stripped_label.replace('&nbsp;', '')
            stripped_label = stripped_label.replace(':', '')
            if stripped_label == fieldname.replace('_', ' '):
                field = label.parent
                break

        if field is not None:
            return field.find(class_='field-item').string
        else:
            return None

    def image_preview(self):
        img = self.soup.find('img', class_='image-preview')
        src = img.attrs['src']
        return src

    def image_src(self):
        return self.image_preview().replace('.preview.', '.2000x2000.')


class NodePage(Fetchable):
    def __init__(self, session, path):
        self.session = session
        self.path = path
        self.text = ""
        self.soup = None

    def url(self):
        return "http://{}{}".format(HOST, self.path)

    def get(self):
        return Obj(self.path, self.fetch())


def main():
    username = os.environ['DTIBET_USER']
    password = os.environ['DTIBET_PASSWORD']

    s = Site(username, password)
    s.login()

    for pagenum in range(NUM_PAGES + 1):
        lp = s.get_collection_page(pagenum)
        for node in lp.linked_nodes():
            nt = node.get()
            filename = nt.local_path()
            with open(filename, 'w') as f:
                print('writing ' + filename)
                f.write(nt.as_toml())

if __name__ == "__main__":
    main()
