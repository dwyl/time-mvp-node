# Time MVP

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


## How?

The code in this project/MVP is meant to be: (_in order of priority_)
+ _**Functional** - it works well enough for **me** to start using it!_
+ _**Human-readable** so **anyone** with basic HTML/JavaScript knowledge
can read and **understand*** it_.

We are _not_ making _any_ attempt to make the code:
"_High Performance_", "_Scalable_" or "_Elegant_" in _any_ way. <br />
We consider the MVP to be "_quick_" but _not_ "_dirty_".

### Environment Variables




### _Implementation_ Notes

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

### `Tachyons` for UI Consistency

Rather than writing a _lot_ of CSS by-hand/from-scratch
we are using the _awesome_ Tachyons <br />
because it's _**fast/small** & **functional**_!
If you have never heard of it and are _curious_ (_you `should` be!_), <br />
see:
[github.com/dwyl/**learn-tachyons**](https://github.com/dwyl/learn-tachyons)


### `PostgreSQL` for Persistence (_Saving Data_)

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
