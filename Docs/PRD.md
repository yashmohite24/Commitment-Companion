# Commitment App

# **Problem Statement:** 

Making new commitments is easy but to keep up on those commitments and following through with the decisions is tough. 

# **Idea:** 

This app will help make it easier for the people to keep up with their commitments, here’s how: 

* **Accountability:** we will help people make a commitment in public, either with strangers or with your friends who want to see you succeed  
* **Motivation:** users will wager something they would give up and give their companions incase they loose \- eg: Amazon Gift Card, dinner at a fancy restaurant, anything\!

The idea is to just create a 

# **Terminology:** 

- **Challenger:** the user who is creating a challenge on the app  
- **Companion:** the observers who are looking to   
- Challenge  
- Wager  
- Check In

# **Case Studies/Examples:** 

1. Yash wants loose 5kgs in 2 months so he creates a challenge on the app, with his 4 friends as *Companions*

# **Challenge Mechanics:** 

- For the V1 we will only be focusing on daily challenges  
- Each challenge will be configured with certain important meta-data like:   
  - Start Date \[Date\]  
  - End Date \[Date\]  
  - Lives \[Integer\]  
  - Daily Check-in Deadline \[Time\]  
    Note: the above is **not an exhaustive** list of fields, there will be dedicated user story for the same  
- The *Challenger*  will be required to check in and submit proof of work daily before the set Check-in Deadline  
- Submission of Proof of Work will be in the form of media, allowed formats: photos, videos, voice recordings and documents  
- *Companions* will review and approve a proof of work and once approved, the *Challengers* task for the day is done  
- This cycle will repeat until the end of the *Challenge* 

**What is the concept of *Lives*? How does it affect the challenge?** 

- Think of lives as a safety mechanism or insurance against failing the challenge  
- Sometimes life takes over or we have unavoidable circumstances, to plan for this we have the concept of ‘Lives’  
- Example: Lets say Ansh, a challenger has configured a challenge with for 15 days. He has been consistently uploading proof of work for 10 days but then he falls sick and fails to upload the proof of work on the 11th day.  
  - **Scenario with ‘Lives’ Configured:** Assuming Ansh had configured the challenge with 3 lives, when he fails to upload a proof of works on the 11th day one of the 3 available lives consumed and the challenge stays alive and moves to the next day  
  - **Scenario with ‘Lives’ NOT Configured:** in this case, on the 11th day, when he wouldn’t upload the proof of work, the Challenge would fail   
- In summary, one life gets consumed when the challenger fails to upload the proof of work one day  
- Once all the lives have been consumed and the challenger fails to upload a proof of work, the challenge fails

**How long will the *Challenge* remain active?**

- The Challenge ceases to remain active once it ends, here are the following scenarios when the challenge will end:   
1. End Date Reached: when the configured end date of the challenge is reached  
2. *Challenger fails the Challenge:* when the *Challenger* fails to submit the daily check-in of their proof of work once the challenge is over and marked as failed.   
   **Exception**: challenges can have lives configured; if that is the case then the challenge doesn’t fail until all the lives are consumed

   
**When does the Challenger submit the proof of work?** 

- Challenger can submit their daily proof of work anytime **BEFORE** the configured deadline time  
- After the deadline time is reached, the option to upload the proof of work will be disabled and the *Challenge* fails  
  **Exception:** if the *challenge* has any lives available, then they would get consumed and the *Challenge* would continue


**How do the Companion Approvals affect the mechanism?**

- The Proof of Work submitted by the *Challenger* isn’t considered like a valid check until ALL the approvers approve it  
- Here are a few scenarios and how they are to be handled:   
1. All *Companions* approve the Proof of Work before the deadline \[Happy Path\]  
   1. In this case, the Proof of Work will be accepted as a valid check-in and the *challenge* continues  
2. Some *Companions* reject the Proof of Work before the deadline  
   1. Even if one Companion rejects the Proof of Work, it will stand rejected  
   2. In this case, the *Challenge* will not fail, the *Challenger* will be able to resubmit a new Proof of Work   
   3. This cycle can continue infinite number of times until the deadline for the day is not reached   
3. All *Companions* **do not** approve the Proof of Work before the deadline   
   1. In this case, the *challenge* will temporarily move to the next day, being conditionally considered as ‘approved’ until the *Companions* don’t give in their decision. Here too there are 2 scenarios:  
      1. All *Companions* approve the proof of work submission:   
         The check-in for that day will now be considered approved and the challenge continues   
      2. Some *Companions* reject the proof-of-work submission: in this case the proof-of-work submission was rejected after the deadline thus the *Challenger* will get an additional 24 hours for submitting the new proof of work.

         **Example**: assuming Pooja has been consistent with her 30 day *Challenge* for the 22 days. On the 23rd day the all the *Companions* are not able to decide on her Proof of Work for the 23rd day. Thus the *Challenge* temporarily moved on to the 24th day. On the 24th day her submission for the 23rd was rejected. In this case, she will now have to upload 2 proof of work submissions one for the 23rd and the other for the 24th. This is special case of delayed approval	

      

      

      

**What are the states of a Challenge?**  
Each *Challenge* can have the following states: 

1. **Check-in Pending**: when the challenger is yet to share their proof of work for the day  
2. **Pending Validation:** when the checkin is beig evaluated by the *Companions* to validate the proof of work  
3. **Check-in Done**: when the *challenger’s* daily proof of work submission is accepted by the *Companions* and   
4. **Check-in Missed:** when the challenger missed sending the proof of work for the day but was saved by an active life  
5. **Challenge Failed (Settle Wager):** when the challenger fails to send in their proof of work for the day and there is no active life   
6. **Challenge Successful:** when the user consistently sends their proof of work daily to until the last day of the challenge to successfully complete the challenge \[Note: the success of the challenge is unaffected even if the challenger has used lives during the challenge\]

**Editing a Challenge:** 

- Once a challenge is created, the user won’t be able to edit the challenge  
- However, a *Companion* will have the option to leave the *Challenge* provided they are not the only *companion* for the challenge

**Challenger-Companion Relationship:**

- These are not some predefined or strict roles which a user on the app has to adhere to, they are relational roles  
- One user is a *challenger* with respect to his *challenge* but can be a *companion* to someone else in their challenge  

**What happens when a challenge fails?** 

- When a challenge fails, the challenger has lost the wager and is now obligated to pay the agreed-upon wager to the Companions  
- The challenger now has to pay the wager to the challengers and share it on the challenge overview screen, similar to recording the proof of work  
- The companions will now have to verify the proof of wager and this will officially close the challenge

# **Design:** 

**Layout:** 

- App with 3 main sections \- Companion | Challenges | My Profile

**Challenge Section:**

- By default the app will open on this section  
- Only the live/ongoing challenges will be shown on this screen  
- Each *challenge* will be represented as a card  
- Button to create a new challenge  
- Button to show the expired challenges  
- Challenge section to house Challenge Cards in an infinite scroll

**Challenge Card:** 

- Challenge cards to have the following details: 

| Datapoint  | Details |
| :---- | :---- |
| Challenge Name/Title | Name of the challenge \- to be stored in String format |
| Progress Bar | To show the progress to the user, to be shown as a percentage out of 100 |
| Progress Percentage | (No. of successful checkins/ Total duration of the Challenge) \* 100**Example**: Daily challenge, for a month6 days have passed and I have checked in on each of the 6 days, in this the progress would be 6/30\*100=20% |
| Lives/Saves (If applicable for the challenge) | Lives/Saves are used against a missed check in to continue a challenge. The user can choose to enable/disable this for a particular application |
| Check In Status  | Shows the status of check in, 3 possible options: Check In Done Check In Pending Check in Missed Pending Validation Challenge Failed, Settle Wager Challenge Closed (Challenge Closed(A failed challenge will have two possible statuse \- Challenge Failed, Settle Wager and Challenge Closed ; the difference between the two is only the settling of the wager. Challenge will be considered closed when the wager is settled) Challenge Success  Example: daily challenge \- Yet to check in \-\> Status \= Check In Pending Check in done \-\> Status \= Check In Done Check in missed \-\> Status \= Check in Missed |
| Checkin (Button)(CTA) | Button which starts the checking in flow: ask the user to either click a photo from the camera or upload from the phone storage, number of media items restricted to the number configured while taking in the challenges |
| ~~Message Count~~  | ~~Number of new messages that have come in the challenge chat since it was last opened (show to the top right hand side of the card)~~ (will pick up in a  later version) |

| Check-in Status  | CTA |
| ----- | ----- |
| Check-in Done | \- |
| Check-in Pending | Check In |
| Check-in Missed | \- |
| Pending Validation: Case 1: Before Deadline Case 2: After Deadline (next day)(when all the companions haven’t verified the check-in and it has provisionally moved to the next day) |  Case 1: No CTA Case 2: Check In |
| Challenge Failed | Settle Wager |
| Challenge Successful | \- |

- Each *Challenge Card* will be clickable and open the *Challenge Overview/Challenge Chat View*. This is applicable for both Live and Expired Challenges 

**Accessing Archived Challenge:** 

- There will a filter to the top of the Challenge Section in the form of tags with two options: Active, All  
- Selecting the the relevant filter will only populate those *Challenge Cards* on the app

**Creating a Challenge:**

1. *Challenge* section to have a dedicated option to Create a New Challenge  
2. Create a new challenge to have the following form:   
   - **Challenge Name** \- String \[Limit of 200 characters\]  
   - **Start Date \-**  Date \[Today or beyond\]  
   - **End Date \-** Date \[only after the start date\]  
   - **Wager** \- String \[Limit upto 300 characters\]  
   - **Lives \-** Integers \[should be less than half the total duration of the challenge\]  
   - **Companions \-** user will have to select from their contact list who are part of the app \[limited to 10 Companions\]

**Challenge Overview/ Challenge Chat View:** 

- On clicking the challenge card a chat-like interface will open up with the challenger and the companions of the challenge as the participants in the chat view  
- Top side of the screen show the *Challenge Details \-* the same details shown on the card, this should be an independent component, separate from the chat interface   
- ~~The chat interface is where all the Challengers and the Companions can chat/ talk here. The idea is to allow *Companions* to be able to motivate the *Challenger* right in the app~~ (not in the current version)  
- there will be some custom chat widgets:  
  - **Proof of Work**:   
    - A dedicatedn button to upload a proof of work for the challenge  
    - when the challenger uploads the check in media, it will appear on the chat, accessible for both the Challenger and the Companions, similar to how media is share over WhatsApp \[in the current release, the users won’t be able to chat\]  
  - **CheckIn Approval:** (only visible to the Companions), this will be visible along with the Proof of Work, the companions will have the follow options:   
    - Accept: Proof of Work accepted   
    - Reject: Proof of work rejected, if the deadline is yet to pass the challenger can submit a new proof of work but if the deadline has passed then it it will be given 24 additional hours to submit proof of work for that day  
  - **Check in Approval Status:** a simple to show how many of the total *Companions* have accepted the Proof of Work. Example: 4/6 (4 approvers out of the 6 have approved the proof of work), clicking on the number should be trigger a hover state to show the names of the Companions and their action, approval shown with a simple green tick and who haven’t approved would be shown with a Pending  
  - **Lives Remaining** (if applicable): shows how many lives have been consumed and how many are remaining. 

**Companion Section:** 

- This section will have all companion-related workflows  
- Layout: this screen will serve 2 purposes:   
  - Show *‘Companion Requests’* (requests from your friends to add you as a *Companion* to their *Challenge*)   
  - Show *Challenges* where you are currently are a *Companion*  
    

**Challenge Screen \- Challenge Requests:**

- The request will have the following details:   
  - Challenger Name:  
  - Wager   
  - Challenge Name  
  - Start date  
  - End Date   
  - Duration  
- Possible Actions: Accept ,Reject  
- Once the request gets acted on, the request will be removed from the request section

**Challenge Screen \- Ongoing Challenges:**

- The challenge card will have the following details:  
  - Challenger Name  
  - Challenge Name  
  - Completion Percentage  
  - CTA/ Action Button  
  - Time Left to action: time left for the companion to validate the request   
  - Challenge Status

  - ##### ~~Message Count: to the top right-hand side of the Challenge Card, the count of messages shared in the message chat would be shown here~~ (Not in the current release)

**Challenge Overview/ Chat Overview Screen:** 

- Clicking on a *Challenge* opens the same chat interface that the *Challengers* have access to \[Users won’t be able to chat in the current release\]  
- The widgets are covered above

**Profile Section Details:**  
This section will have data in two different parts: 

1. User Data  
2. Company data

	  
 	**User Data :**

| Data point  | Calculation Logic  |
| :---- | :---- |
| Consistent Since: \[Days\] | Number of days the challenger has successfully submitted a proof of work that the companions have accepted Note: **do NOT** include the days where lives were used when the challengers failed to send a proof of work |
| Longest Streak : \[Days\] | Maximum time spent without breaking a challenge  |
| Wager Settlement Ratio: \[Percentage\] | \[Number of wagers settled / Total number of wagers\] \* 100 |
| Number of challenges: \[Count \] | Total number of challenges created by the user till date  |
| Challenges Companioned | A number of challenges in which the user was a companion  |
| Wagers Realized  | Number of challenges in which the user was a challenger and won the wager, that is, the challenge was failed by the challenger  |

**Company Data:**

1. Data and Privacy Policies:  
2. Provide feedback: Users will be able to provide feedback. There will be a header section and a message section. The message typed here by the user should be added to a dedicated Google Sheet 

# **User Stories:**

## User Story 1: Viewing a Challenge as a Challenger

As a *Challenger,* I should be able to see all the challenges on the app. The challenges should be visible under two distinct tabs: *Live Challenges* and *Archived Challenges*. *Live Challenges* will have all the challenges that are currently live for the user and *Archived Challenges* will have the challenges that have expired. 

### Steps for Viewing Live Challenges:

1. Users opens the app and by default is brought on the *Challenges* tab, there will be total of three tabs \- Companion | Challenges | My Profile  
2. By default only the live challenges will be visible and the relevant filters will be applied  
3. All the live challenges are available in the form of cards on the *Challenges* tab  
4. Each Card shows information about that *Challenge*  
5. User can open any specific challenge  they are interested in

### Steps for Viewing Archived Challenges:

1. Users opens the app and by default is brought on the *Challenges* tab, there will be total of three tabs \- Companion | Challenges | My Profile  
2. By default only the live challenges will be visible and the relevant filters will be applied  
3. User clicks on the ‘Past’ filter available to the top of the screen  
4. All the past challenges will be shown in the form of cards on the *Challenges* tab, similar to the Live Challenges  
5. Each Card shows information about that *Challenge*  
6. User can open any specific challenge  they are interested in

### Challenge Card Details: 

| Datapoint  | Details | Data Type |
| :---- | :---- | :---- |
| Challenge Name/Title | Name of the challenge | String |
| Progress Bar | To show the progress to the user, to be shown as a percentage out of 100 | \- |
| Progress Percentage | (No. of successful checkins/ Total duration of the Challenge) \* 100**Example**: Daily challenge, for a month6 days have passed and I have checked in on each of the 6 days, in this the progress would be 6/30\*100=20% | Integer (round off when the number is not an integer) |
| Lives/Saves (If applicable for the challenge) | Lives/Saves are used against a missed check in to continue a challenge. The user can choose to enable/disable this for a particular application | \- |
| Check In Status  | Shows the status of check in, multiple possible options: Check-in done Check-in Pending Check-in Missed Pending Validation Challenge Failed, Settle Wager Challenge Closed (Challenge Closed(A failed challenge will have two possible statuses \- Challenge Failed, Settle Wager and Challenge Closed ; the difference between the two is only the settling of the wager. Challenge will be considered closed when the wager is settled) Challenge Success  Example: daily challenge \- Yet to check in \-\> Status \= Check-in Pending Check-in done \-\> Status \= Check-in Done Check-in missed \-\> Status \= Check-in Missed Represent this with the  | Flag |
| Checkin (Button)(CTA) | Button which starts the checking in flow: ask the user to either click a photo from the camera or upload from the phone storage, number of media items restricted to the number configured while taking in the challenges | \- |
| ~~Message Count~~ | ~~Number of new messages sent since the last time the chat was opened~~ | ~~Integer~~ (Not in the current release) |

### 

### Challenge Card States:

- There are 6 possible states for the Challenge Cards, each of them will have their own distinct design/visual cue in the Challenge Card  
- **Check in Pending**: when the challenger is yet to share their proof of work for the day  
- **Pending Validation:** when the checkin is beig evaluated by the *Companions* to validate the proof of work  
- **Check in Done**: when the *challenger’s* daily proof of work submission is accepted by the *Companions* and   
- **Check in Missed:** when the challenger missed sending the proof of work for the day but was saved by an active life  
- **Challenge Failed, Settle Wager:** when the challenger fails to send in their proof of work for the day and there is no active life   
- **Challenge Completed:** A failed challenge will have two possible statuse \- Challenge Failed, Settle Wager and Challenge Closed; the difference between the two is only the settling of the wager. The challenge will be considered closed when the wager is settled  
- **Challenge Successful:** when the user consistently sends their proof of work daily to until the last day of the challenge to successfully complete the challenge \[Note: the success of the challenge is unaffected even if the challenger has used lives during the challenge\]

| Check-in Status  | CTA |
| ----- | ----- |
| Check-in Done | \- |
| Check-in Pending | Check In |
| Check-in Missed | \- |
| Pending Validation: For Challengers: Case 1: Before Deadline Case 2: After Deadline (next day)(when all the companions haven’t verified the check-in and it has provisionally moved to the next day) For Companions: |  Case 1: No CTA Case 2: Check In Verify |
| Challenge Failed, Settle Wager | Settle Wager |
| Challenge Closed(A failed challenge will have two possible statuse \- Challenge Failed, Settle Wager and Challenge Closed ; the difference between the two is only the settling of the wager. Challenge will be considered closed when the wager is settled) | \-  |
| Challenge Successful | \- |

### Acceptance Criteria: 

1. *Challengers* should by default land on the *Challenges* section when they first open the application  
2. *Challengers* should only see the active *challenges* created by them  
3. *Challengers* should be able to view inactive *challenges* by toggling the   
4. Each *Challenge* card should be clickable and it should initiate the follow up flow  
5. Each *Challenge* card should have their own visual cues and states that would change based on the status   
6. Challengers should be able to the details on each Challenge Card as described in the requirements

## User Story 2: Create a new Challenge

As a user, I should be able to create a new challenge 

### Steps:

1. User opens the app, the Challenge section opens by default  
2. User clicks on the ‘Create a Challenge’ button \-\> Challenge creation screen opens up  
3. The user then enters the required details and then the Challenge gets created

### Create a Challenge Form:

| Field Name | Data Type | Constraint | Mandatory?  |
| :---- | :---- | :---- | :---- |
| Challenge Name | String  | Limit of 200 characters | Yes |
| Start Date | Date | Only today and beyond | Yes |
| End Date | Date | Dates only after 7 days of start date (Each challenge should have the duration of 7 days) | Yes |
| Daily Deadline | Time | By default \- 11:59pm | Yes |
| Wager | String | Limit upto 300 characters  | Yes |
| Lives | Integer | Number should be less than half the duration of the *Challenge* Example: Start Date:1st | End Date 30th Thus Duration \= 30 Max. number of lives possible: \<15 | Yes |
| Companions | Users  | Max number of Companions \=10 | Yes |

- Once the user fills all the details and clicks on create Challenge

### Validations/Restrictions:

1. **Unique Name**: the name of the challenges being created for each user should be unique to their account, check only with active challenges  
2. Each user will only be allowed to create a maximum of 5 challenges for now, when the user tries creating an additional challenge after 5, they should be shown a dialog box saying: ‘You have reached the maximum number of active challenges (5)’  
3. Users can send a maximum of 10 companion requests and can have a max of 10 companions per challenge

### Adding Companions:

- While adding Companions, all those users would be visible who are available on the application  
- The users should also be able to trigger an invite to non-users via text message  
- For the challenge, there has to be atleast one companion who has accepted the request

### Companions Responses:

- All the companions need to accept the request max. 24 hours after the challenge start date  
- In case the companions don’t take an action within the stipulated time frame?  
  - **Case 1:** Some Companions fail to accept the request before the deadline, while others have accepted the request  
    - In this case, those who failed to accept the request 24 hours after the start date will NOT be a part of the challenge, only those who accepted the request will be part of the challenge  
    - Example: Lets assume Amit Shah, Rajnath Singh and Nitin Gadkari get the request for a challenge starting on the 1st of July and both Amit Shah and Rajnath Singh have accepted the requested but Nitin Gadkari hasn’t. Nitin will have time till the 2nd of July to accept the request and if he fails to do so, he will not be a companion for the challenge  
  - **Case 2:** No companion takes an action on the request before the deadline  
    - In this case, the challenge **won’t be created** since there isn’t any companion. The user should be notified that the challenge couldn’t be created since there isn’t any companion  
    - **Behaviour:**   
      - In this case, the challenge will sit as a draft on the challenges section of the screen with the message: ‘Challenge couldn’t be created since no companions accepted the request’  
      - The user can edit the details like changing the start date to a further date, adding new companions or deleting the challenge 

### Acceptance Criteria: 

1. Every user should be able to create upto 5 new challenges  
2. Users should be shown the challenge creation form with the right form fields (with relevant data types and limits) as described in the requirements  
3. Users should be able to send requests to prospective companions to join their challenge  
4. Users should be able to send a max of 10 companion requests and have 10 companions in a challenge  
5. Companions who don’t accept the request upto 24hours after the start of the challenge will automatically be considered to have rejected the request

## User Story 3: Submit a Proof of Work 

As a challenger, I should be able to share a proof of work for my daily check-ins to be verified by my companions

### Steps:

1. Challenger opens the app \-\> by default on the *Challenge* section of the app with the ‘Live’ filter for Live Challenges applied  
2. All the challenge cards are available on the app screen, with different states for the ones where a check-in is due  
3. There are 2 ways the user can go about recording check-in:  
   1. User can simply click on the CTA button \[ ‘Check-in’\] on the challenge card  
   2. User can open the challenge card, and the challenge overview button opens up. At the top of the chat overview, there will be a button to record the check-in  
4. Challengers click on the button and upload media in either of the supported formats  
5. Once the user submits the proof of work as a check-in, the check-in will now be verified by the companions and the relevant status of the Challenge Card would be updated  
6. Once submitte, the users won't be able to change the proof of work submitted as check-in

### Check-in Flow:

- Check-in button and CTA are available in two places:  
  1. **Challenge Card CTA:** a dedicated button on the challenge card available on the challenge section  
  2. **Challenge Overview Screen:** after opening each challenge, there will be a dedicated Challenge Overview where the users will be able to submit their check-ins  
- Both the above-mentioned buttons will initiate the same flow for recording the check-ins:  
  1. User to be given an option to pick select a media type, available options:   
     - Photos  
     - Videos  
     - Documents  
     - Recordings   
       Note: this is not an a hard set of requirements to follow, here we can use the stock flow provided by Android and iOS  
  2. The user can upload multiple files or types of files but there will be a limit of 20mb  
- Once the challenger submits the proof of work the status of the Challenge will change to \-\> ‘Verification Pending’  
- The daily Check-in will only be available until the deadline time for the day, if the user fails to submit their check-in by then either the challenge fails (if a life is not available ) or a life gets consumed (in scenarios when a life gets consumed)

### Change in Challenge Status:

| Action | Status Changes to | CTA |
| :---- | :---- | :---- |
| User Submits Proof of Work for Check-In | Pending Verification | \- |
| Proof of Work accepted as Check-in | Check-in Done |  |
| Proof of Work rejected by Companions | Check-In Pending | Check In |
| Proof of Work is not verified by all companions after the deadline has passed | Check-In Pending  | Check-in (to allow the submission of proof of work for the next days) |

### Acceptance Criteria:

- User should be able to access the check-in flow either via the Challenge Card of via the Challenge Overview screen  
- The challenge cards visible on the screen should show the right status  
- Users should be able to add proof of work as a check-in in all the supported media  
- Users should be able to upload multiple pieces of media up to 20 MB

## User Story 4: Chat with companions \[Deprioritised for V1\]

As a challenger, I should be able to chat with the companions associated with a particular challenge

### Steps:

1. User clicks on the challenge card \-\> Challenge overview screen opens  
2. The challenge overview screen is in the form of a chat where the user can now chat with the companions

###  Challenge Overview Screen:

- Number of new messages on a challenge will be shown on the challenge card  
- The overview screen will be in the form of a chat where both the challengers and the companions can chat with each other  
- The layout of the challenge overview screen will be similar to that of WhatsApp, where the date will be mentioned in the chart window   
- The proof of work submitted by users as check-in will appear in the chat as media shared by the challenger  
- Widget to approve or reject the proof of work will be visible in the chat section against the submitted media only to the companions and NOT the challengers  
- To chat, both the challengers and companions will simply have to type their message in the text section and click on the send button to the right side of the text section, similar to what WhatsApp does  
- Currently, there is no option to delete any chat messages sent by the challenges or the companions

### Acceptance Criteria:

- Both Challengers and Companions should be able to view the Challenge Overview section in the chat format when they open a challenge  
- Challengers and companions should be able to message and chat with other members associated with that challenge  
- Companions should be able to view the widget in chat to either accept or reject proof of work sent by the challenger  
- Messages sent by the challenger or the companions should appear in the chat overview section  
- Number of new messages on a challenge to be shown on the challenge card

## User Story 5: View Profile Details

As a user I should be able to view the details associated with my profile

### Steps:

1. User opens the app and by default is brought to the challenges section of the app  
2. User then clicks on the profile section on the main navigation bar at the bottom of the screen, which loads the profile section of the app  
3. User is now able to see all the details related to the profile

### Profile Section Details :

This section will have data in two different parts: 

3. User Data  
4. Company data

 **User Data :**

| Data point  | Calculation Logic  |
| :---- | :---- |
| Consistent Since: \[Days\] | Number of days the challenger has successfully submitted a proof of work that the companions have accepted Note: **do NOT** include the days where lives were used when the challengers failed to send a proof of work |
| Longest Streak : \[Days\] | Maximum time spent without breaking a challenge  |
| Wager Settlement Ratio: \[Percentage\] | \[Number of wagers settled / Total number of wagers\] \* 100 |
| Number of challenges: \[Count \] | Total number of challenges created by the user till date  |
| Challenges Companioned | A number of challenges in which the user was a companion  |
| Wagers Realized  | Number of challenges in which the user was a challenger and won the wager, that is, the challenge was failed by the challenger  |

**Company Data:**

1. Data and Privacy Policies:  
2. Provide feedback: Users will be able to provide feedback. There will be a header section and a message section. The message typed here by the user should be added to a dedicated Google Sheet   
3. Log Out: button to log out from the app

### Acceptance Criteria:

- Users should be able to access the Profile Section of the app  
- Numbers/Details shown on the profile section should be correct and  calculated on the basis logic mentioned in the requirements

## User Story 6: Settle the wager

As a challenger who has lost a challenge, I should be able to settle a wager owed to the companions

### Steps:

1. User opens the app \-\> by default, the Challenge screen opens up  
2. Challenge screen shows all the challenges in the form of challenge cards  
3. Assuming the user has lost a challenge and the wager needs to be settled \-\> challenge card will show the ‘Challenge Failed’ state and the CTA will be ‘Settle Wager’  
4. Similar to the general CTA flow, the user will be able to initiate the wager settlement flow in 2 ways:   
   1. User clicks on the Settle Wage CTA on the challenge card  
   2. User clicks on the challenge card to view the challenge overview screen where they can settle the wager  
5. Settling the wager is similar to uploading the proof of work while checking in

### Settling the Wager:

- Settling the wager is similar to uploading a proof of work while checking in  
- This will just be a special case of uploading the proof of work where there won’t be an end date  
- Challenger will be required to upload proof of settling the wager in terms of media upload with a limit of upto 20MB  
- Companions, too will be required to validate the proof of wager settled, similar to the Proof of Work check-in, in this case, too, the companions will not have a time limit to validate the proof  
- Once all the companions have validated the proof of settling wager, the challenge will be closed and wager will be considered to be settled  
- Note: all the challenges that have failed will continue to appear on the challenges screen when the challenge fails UNTIL the wager is settled

### Acceptance Criteria:

- Challenger cards show the relevant status when the challenge fails with correct CTA in line with the requirements  
- Users should be able to settle the wager by clicking the CTA ‘Settle Wager’ through the Challenge Cards and Challenge Overview screen   
- Challenge Cards with ‘Challenge Failed, Settle Wager’ status should be visible on the Challenge section of the app even after the end date of the challenge is passed  
- Companions will be required to approve the settle wager proof sent by the challenger  
- Only when the companions approve the wager settlement request, the wager will be considered settled and the Challenge will be closed  
- Challenge Cards where challenge has failed and the wager is settled should be automatically archived

## User Story 7: View a Challenge and be invited to a Challenge as a Companion

As a companion, I should be able to view and be invited to challenges as a companion. 

### Steps:

1. User opens the app and is by default brought on the Challenges section of the application  
2. User then clicks on the Companion section of the app and the Companion screen opens up  
3. User is shown all the challenges where they are a companion  
4. Each challenge card will have the relevant status and CTA

### Challenge Screen:

1. Challenge Screen will be divided into 2 following parts:    
   1. **Challenge Requests**: requests for you to join a challenge as a companion  
   2. **Ongoing Challenges**: live challenges where you are already a companion  
2. The challenge screen to show the live challenges by default  
3. There will be filters in the form of a tag with options: ‘Live’(applied by default), ‘Past’  
4. Clicking on ‘Past’ will also show the past challenges which were previously hidden

### Challenge Screen \- Challenge Requests:

- The request will have the following details:   
  - Challenger Name:  
  - Wager   
  - Challenge Name  
  - Start date  
  - End Date   
  - Duration  
- Possible Actions: Accept ,Reject  
- Once the request gets acted on, the request will be removed from the request section

### Challenge Screen \- Ongoing Challenges:

- The challenge card will have the following details:  
  - Challenger Name  
  - Challenge Name  
  - Completion Percentage  
  - CTA/ Action Button  
  - Time Left to action: time left for the companion to validate the request   
  - Challenge Status  
  - Message Count: to the top right-hand side of the Challenge Card, the count of messages shared in the message chat would be shown here  
- User will be able to click on the challenge card \-\> that would open  the challenge overview/challenge chat screen (users won’t be able to chat in the current release)

### Acceptance Criteria:

- When I visit the companion section, I should be able to see both the companion requests (if any) or the active challenges in which I am a companion  
- Companion request should have all the details as mentioned in the requirements  
- Challenge card should also have all the details as mentioned in the requirements above  
- Clicking the challenge card should open the challenge overview/challenge chat screen  
- User should be able to toggle the filters for viewing challenge cards between live and past challenges

## User Story 8: Leave a challenge as a companion

As a companion I should have the ability to leave a challenge that I have joined as a companion

### Steps:

1. Companion opens the app and is by default bought on the challenge section  
2. Companion will then navigate to the Companion section of the application and the Companion screen opens up showing all the companion requests and the challenge cards  
3. Companion will click on the challenge card of the challenge they wish to leave  
4. In the challenge overview section at the top of the screen, there will be an option to leave the challenge  
5. Companion clicks on this option and will be shown a confirmation box if they are sure they want to leave the challenge  
6. On confirmation the companion will leave the challenge and the chat overview of the challenge will be updated with the same

### Constraints: 

1. A companion can only leave the challenge as long as there are other companions available in the challenge  
   1. Basically, every challenge should at least have one companion  
   2. If the last companion tries to leave the challenge, they will not be allowed to do so and will be shown an error message saying, "At least one companion required to continue challenge. Thus, you cannot leave the challenge." 

### 

### Behaviour: 

1. Companion leaves the challenge  
2. Chat of that specific challenge will be informed that that specific companion has left the challenge  
3. Everybody in that challenge, both other companions and the challenger, will be notified via relevant notification  
4. Once the companion leaves the challenge, that challenge card will no longer be visible and accessible to that companion

### Note:

It's possible for companions to leave a live challenge midway but it is not possible to add a companion to a life challenge.

### Acceptance Criteria:

- Companion should have the option to leave the challenge for every challenge card that is live  
- Companions should be able to live every live challenge provided they are not the only companion. In other words they are at least one other companion  
- When a companion wants to leave a challenge, they should be shown a confirmation dialogue box with a message asking them whether they actually want to leave the challenge. Only when they accept or they give their confirmation should they be allowed to leave the challenge  
- Once the companion decides on leaving the challenge, that specific challenge should no longer be visible to them.   
- The relevant notification should be triggered to the other companions and challenger  
- The chat overview for that challenge should also be notified that the specific companion has left the challenge. 

## User Story 9: Verify Proof of Work

As a companion, I should be able to verify the check-in proof of work submitted by the challenger

### Steps:

1. Companion opens the app and is by default brought to the challenges section.   
2. Companion then clicks on the companion section to open up the companion section  
3. The companion section will have the challenge cards of all the challenges that are currently live.   
4. Whichever challenge has a validation pending will show the relevant status with the specific CTA signaling to the companions that their validation is required.   
5. The Companion can either click on the CTA to check the media or open the challenge overview section and see the proof of work sent by the challenger in the chat.   
6. After validating the media, the companion will either have to select one of two options:  
   1. Accept  
   2. Reject  
7. Once all the companions act on the media, the media should automatically be deleted  
8. A log should remain, Check In Verified \[Media Automatically deleted\] or Check In Rejected \[Media Automatically Deleted\]

### Behaviour:

- Challenge cards which require companion intervention for verification will show the status as pending verification and have the CTA specifically for companions as verified  
- Companions can enter the verification flow either by clicking directly on the verify CTA or by clicking on the challenge card and viewing the proof of work in the chat overview section  
- Once the flow begins, the companion will be shown the media uploaded by the challenger and will be shown two options:  
1. Accept  
2. Reject  
- Once the companion selects an option, their response will be recorded and accordingly the challenge will be updated once all the companions have given their decision  
- Relevant notifications will be triggered (if any)  
- Once the Check in is either completely accepted or rejected, the media will be removed from the chat and deleted from the data base

### Acceptance Criteria:

- Once the proof of work is sent, the Companions should be shown an option verify the proof of work  
- When the user acts on the Proof of Work, their response should be noted and the relevant processing takes place (Challenge Card Status changes, Challenge Card CTA etc)

 

