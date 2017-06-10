# Time MVP > https://time-mvp.herokuapp.com

[![Build Status](https://travis-ci.org/nelsonic/time-mvp.svg?branch=master)](https://travis-ci.org/nelsonic/time-mvp)

![MVP](https://cloud.githubusercontent.com/assets/194400/25544312/d77c27b4-2c51-11e7-9978-a5a434d0cf28.png)

> _The **simplest version** possible of [Time](https://github.com/dwyl/time) <br />
written in the **least sophisticated language**
in the **shortest** amount of **time** <br />
to get **something working fast** so I can **start testing** it on **myself**
(and other "**early adopters**") <br />
So we can **iterate** on features fast! <br />
AKA ["plan to throw one away"]!_

## Why?

To get _something_ I can start using _myself_ and _measure_ my own usage
while retaining `control` of my (_personal_) data.<br />
(_I'm tired of using closed-source time/task trackers
`while` we're building the "Real" version of Time!_)

![buildmeasurelearn](https://cloud.githubusercontent.com/assets/194400/25544285/ba5b81ca-2c51-11e7-9cf0-b24364a1975b.jpg)


## What?

The Time application written in JavaScript/Node.js
without any "_frameworks_" or "_libraries_" just to get something working
as fast as possible!

> This code is to "scratch my own itch"
so please don't "_judge_" it for "_quality_"!
_However_ it is meant to be "_readable_" so if there is anything
unclear, please feel free to post a **question**:
https://github.com/nelsonic/time-mvp/issues
(_I don't "byte"! and usually reply within a couple of hours..._)



> See: Implementation Notes (_below_)


## How?

The code in this project/MVP is meant to be: (_in order of priority_)
+ _**Functional** - it works well enough for **me** to start using it!_
+ _**Human-readable** so **anyone** with basic HTML/JavaScript knowledge
can read and **understand*** it_.

We are _not_ making _any_ attempt to make the code:
"_High Performance_", "_Scalable_" or "_Elegant_" in _any_ way. <br />

The best way to get started is to run this example *locally*.

> _As always, if you have **any questions** or get stuck,
we are here to help! Open an issue/question:
https://github.com/nelsonic/time-mvp/issues

### 0. Pre-Requisites

You will need to have two things installed `before` trying to run the code:
+ Node.js (_with NPM_)
+ PostgreSQL

> Please ***ensure*** you have ***PostgreSQL Installed and Running*** on your local machine
***before*** you attempt to run this example.
> see: https://wiki.postgresql.org/wiki/Detailed_installation_guides

### 1. Clone the repo:

```sh
git clone https://github.com/nelsonic/time-mvp.git
cd time-mvp
```
### 2. Install *Dependencies* from NPM

```sh
npm install
```

### 3. Environment Variables

Ensure you have the Required Environment Variables:

create an `.env` file in root of the project

and add a line for your `DATABASE_URL`.
e.g:
```sh
export DATABASE_URL=postgres://postgres:@localhost/test
export TEMPLATE_DIRECTORY=./lib/email_templates
export SENDER_EMAIL_ADDRESS=your.aws.verified.email.address@gmail.com
export AWS_REGION=eu-west-1
export AWS_ACCESS_KEY_ID=YOURKEY
export AWS_SECRET_ACCESS_KEY=YOURSUPERSECRET
```

> The `default` on Mac is: export DATABASE_URL=postgres://postgres:@localhost/test  
> if you don't *already* have a database called `test` on your system,  
> create it now by running this command in your psql/pgadmin: `CREATE DATABASE test;`

Most of these environment variables are for sending
emails via AWS SES using
[sendemail](https://github.com/dwyl/sendemail#2-set-your-environment-variables)
if you are only trying this out on your localhost
you won't need to set these and the email sending
feature will degrade gracefully.

### 4. Run the Tests

```sh
npm test
```

**Note**: running `npm test` will first execute `npm run create` which creates
the necessary Database Tables to run the app. see:
[/test/database_setup.sql](https://github.com/nelsonic/time-mvp/blob/master/test/database_setup.sql)

### 5. Run the Server

```sh
npm run dev
```

## _Implementation_ Notes

### Absolute _Bare Minimum_ Dependencies

_Most_ people are lead to believe that they need to learn/use
the latest & greatest framework in order to build _anything_.

This _complete_ has **_Exactly Five_ Dependencies**. <br />
see: https://github.com/nelsonic/time-mvp/blob/master/package.json <br />
i.e: No React, Redux, Babel, Webpack, Express/Hapi, etc. <br />
This is _not_ a "_coincidence_".
It's _certainly_ not because we (_reasonably experienced developers_)
don't _know how_ to use these frameworks/libraries ...


While we have attempted to make this MVP as _simple as possible_
by not using any server-side or client frameworks,
we have opted to use a couple of tools for the following reasons:
+ They are in the spirit of MVP (_no bloat_)
+ They are in our chosen
["stack"](https://github.com/dwyl/technology-stack)
so we will be able to re-use code
in the "Real" version of the Time app.
+ Most people in our organization are _familiar_/_experienced_
with these tools so the code in this MVP will be easy to understand.
+ We have a "Beginner Level" ***Tutorial*** `forEach` one
(_see links in each sub-section below_) so the learning curve is shallower.

### `Tachyons` for UI Consistency

Rather than writing a _lot_ of CSS by-hand/from-scratch
we are using the _awesome_ Tachyons <br />
because it's _**fast/small** & **functional**_!
If you have never heard of it and are _curious_ (_you `should` be!_), <br />
see:
[github.com/dwyl/**learn-tachyons**](https://github.com/dwyl/learn-tachyons)


### `PostgreSQL` for Persistence (_Saving/Storing Data_)

PostgreSQL is the not the _fastest_ Datastore,
(_that would be [Redis](https://github.com/dwyl/learn-redis) ..._)
However PostgreSQL is the
[4<sup>th</sup> **most popular**](https://db-engines.com/en/ranking) Database
in the world (_not that you should base decisions on "Popularity Contests"
but in this case it means that many people will understand the MVP
and can re-use/extend it if they chose to!_)
_also_ PostgreSQL is the `default` database in Phoenix (Ecto)
so we will be able to _re-use_ the Database (_or at least easily migrate_)
in the "Real" version of Time.
If you are new to PostgreSQL, please see:
[github.com/dwyl/**learn-postgresql**](https://github.com/dwyl/learn-postgresql)


### Deployed to `Heroku`

The _fastest_ way we know to ship an application
is using Heroku (_5 mins_). <br />
_**You can too**_:
[github.com/dwyl/**learn-heroku**](https://github.com/dwyl/learn-heroku)


## Answers! (FAQ)

> _**Q**: **Why** Build a
[**Minimum Viable Product**](https://en.wikipedia.org/wiki/Minimum_viable_product)
("MVP") if you **know** it's not the "Real" thing?_ <br />
> _**A**: If you are unfamiliar with why we build MVPs
please read ["The Lean Startup"](https://youtu.be/fEvKo90qBns)_.


> _**Q**: **Why JavaScript**?_ <br />
> _**A**: Because for better-or-worse it's
**the language everyone knows**! <br />
(and **annyoningly** it's what I have the most **practice** with
so can write faster than Elixir/Erlang, for now...)._

> _**Q**: **Why aren't** you using any "**Frameworks**"?_ <br />
> _**A**: I am! Tachyons & Fontawesome! but no JS frameworks/libraries
because we don't **need** them for an MVP!_
