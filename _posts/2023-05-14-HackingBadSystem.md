---
layout: single
classes: wide
title:  "Is Hacking Bad System Fine? "
---

Hacking is not the right thing.
Oxford Dictionary defines hacking as <i>the gaining of unauthorized access to data in a system or computer. </i>
As a developer, I know there's no perfect (or at least extremely time-consuming) system that no one can break.
As a (potential) hacker, it is always tempted to break the system not when I want to make benefit out of the system, but when the system sucks.
It happens when system builders don't care about users.
The mismatch between builders' goals and users' satisfaction often occurs when a buyer and a user are different. 
This commonly happens when one person represents a lot of others.

I try my best to keep my blog politically neutral, so only one episode will be introduced.
There are a few cities, and countries that offer inconvenient public services, such as getting an appointment for registration of residence or visa extension.
Even if the country offers overall good welfare and public healthcare, this small bottleneck could push great talents out of the country.
Which could very like bring more contribution to GDP and tax than consumption.

This discrepancy occurs when decision-makers (government officers) don't care about the users' convenience because this is not their KPI.
For instance, achieving a visa appointment (<i>Termin</i> in German) is almost impossible in Berlin.
Most of my friends went through 6-9 months of the endless waiting process.
This works if the applicant is either a student or an employee.

However, let's imagine (not necessarily my case) that an entrepreneur found great potential in building a business in Germany and setting the headquarters in Berlin.
A dynamic startup faces countless challenges such as pivoting, fundraising, and legal issues,...
All issues can be handled by working hard but she/he should leave Germany because of visa.
she/he has the right to stay in Germany but auslanderbehöde doesn't give a visa appointment.

Here's a too-long introduction to justify my (semi) hacking the system.
The first easy crack is to use this [chrome-extension](https://chrome.google.com/webstore/detail/berlin-appointment-helper/ngdeikpgeefjhldilcfpjnppmpaagnae).

It uses a session and iterate 19 times. However, the session expires every 30 minutes, so you need to run this again.

Here's the complete solution to hack the visa appointment system. 

[![Hacking Demo](..\img\hacking_demo.gif)](https://github.com/ccomkhj/berlin-auslaenderbehorde-termin-bot "Visa Termin Bot") 

Check this [repo](https://github.com/ccomkhj/berlin-auslaenderbehorde-termin-bot) and you can run a bot countless checking the empty slot and applying for the appointment.
I contribute to making this automation works remotely, so even you don't have to keep "on" your machine at home.
Just run it in a cloud machine or your workstation in the work space.
If you are not a programmer, feel free to contact me, I'm more than happy to help you.

Curretnly, there's no IP blocking system, so you can send the form to the system every ~3 seconds.

P.S. I cracked the system and book the appointment in 72 hours.