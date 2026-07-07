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
| Wager Settlement Ratio: \[Percentage\] | \[Number of wagers settled / Total number of wagers\] \* 100 When the number of challenges created is zero, then return 0 by default  |
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

- Challenge cards that require companion intervention for verification will show the status as pending verification and have the CTA specifically for companions as ‘ Verify’  
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

 

## User Story 10: As a new user I should be able to sign up on the platform

### Steps:

1. I download the application as a new user (I don’t have a profile on the application)  
2. I am shown two options:   
   1. Log In  
   2. Sign Up  
3. Since I am new user I will sign up on the application  
4. I will be shown the relevant sign up form asking all the details  
5. I provide the required details and fill up the form  
6. I am now able to access the application

### Sign Up Form:

| Datapoint  | Datatype | Comments |
| :---- | :---- | :---- |
| First Name | String | 20-character limit |
| Last Name | String | 20-character limit |
| Country | Dropdown to select a country | Note: based on the choice of the dropdown the country code would be autopopulated |
| Phone Number \- Country Code | Integer | This is section of the phone number field itself The country-code will be autopopulated based on the country selected by the user The user will be allowed to change the country code |
| Phone number  | Long | The country code was selected in the above field  Limit to ten digits |
| Email  | Email | Check whether it is a relevant email or not. If not, show a validation failure |
| Password | Character | Atleast 7 characters, atleast one uppercase, atleast one  |
| Sign up button  | Button | When the user clicks on this button, initiate the sign up flow |

### Validation/Errors:

- **Field Level Validation:** When either of the above called-out validations fails, the user should be shown a relevant error message telling them exactly why there was a failure  
- **Duplicate User:** When the user clicks on sign up, check whether there is an existing user with the same details. Here you will check the mobile number. If the same user exists, throw an error showing the user already exists and ask the user to login instead  
- **OTP Validation Error:** Once the user enters the number, we will be sending the OTP, asking the user to verify the details. Once the OTP has been verified, we can create new users  
  - Allow the user to re-trigger OTP(for both email or number) after two minutes  
  - Incase of OTP Mismatch \- give the users the option to go back to the Sign Up Screen and change the validation details

![][image1]

### Identifying Duplicate Users:

- Those users whose mobile number already exists on the platform will be considered as duplicate users  
- Email ID will not be a criteria for the identifying a number as duplicate number

### Acceptance Criteria:

- Only new users (users who don’t already exist) will be allowed to create a user  
- Duplicate users will not be allowed to create a new user, they will be asked to login instead  
- While entering the signup form, the app should check the relevant validation rules recorded in the requirements  
- Once the user submits the form and the user get successfully created, only then you log them into the application, if the user is not created successfully, then you inform them there was an issue and ask them to resubmit the application

## User Story 11: As an existing user, I should be able to log into the application

As an existing user of the application I should be able to log into my application and access my account

### Steps:

1. User opens the application. He is shown the option to either sign up or log in.  
2. User logs in and is shown the log and a form asking the following details:   
   1. Enter mobile number  
   2. Enter Password   
3. Post successful verification the user is able to log into the application

### Login Mechanics:

- For v1 the user will be required to enter the mobile number and the password  
- For the future versions we will allow the user to just enter a mobile number, get an OTP, enter the OTP, and on successful verification of the OTP the user will be logged in  
- Each user will be expected to have a unique mobile number, thus that will be our differentiating factor or identifying factor for a user

### Acceptance Criteria:

- As an existing user when I enter my details, I should be able to log into the application   
- If a user enters incorrect details, they should not be able to log in to the application. They should also be shown the reason for the same.   
- Users who fail authentication will not be allowed to log in to the application. 

[image1]: <data:image/png;base64,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>