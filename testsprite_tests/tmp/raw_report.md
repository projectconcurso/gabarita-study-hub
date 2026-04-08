
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** gabarita-study-hub
- **Date:** 2026-04-07
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Login reaches dashboard
- **Test Code:** [TC001_Login_reaches_dashboard.py](./TC001_Login_reaches_dashboard.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/5b8540fa-56ec-4815-8567-377553693ae9
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Complete profile after signup and reach dashboard
- **Test Code:** [TC002_Complete_profile_after_signup_and_reach_dashboard.py](./TC002_Complete_profile_after_signup_and_reach_dashboard.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/a033cd3a-404b-40cd-a964-b0de79d1f7b2
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Take a practice exam end-to-end to results
- **Test Code:** [TC003_Take_a_practice_exam_end_to_end_to_results.py](./TC003_Take_a_practice_exam_end_to_end_to_results.py)
- **Test Error:** TEST BLOCKED

The simulado could not be created because the account does not have enough Gabaritos to pay the cost.

Observations:
- A "Saldo Insuficiente" modal appeared when attempting to create the simulado.
- The modal shows the simulado cost is 10 and the account balance is 0, so creation is blocked.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/71a7f0d0-3353-4201-8c6b-8c4a5e09ec46
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Sign up reaches email confirmation step
- **Test Code:** [TC004_Sign_up_reaches_email_confirmation_step.py](./TC004_Sign_up_reaches_email_confirmation_step.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/7c999b9c-bc22-4c7c-8d95-0b8867e18941
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Complete profile saves and enters dashboard
- **Test Code:** [TC005_Complete_profile_saves_and_enters_dashboard.py](./TC005_Complete_profile_saves_and_enters_dashboard.py)
- **Test Error:** TEST FAILURE

Saving the profile did not redirect the user to the dashboard as expected.

Observations:
- After clicking 'Salvar Alterações' the application displayed a toast: 'Perfil atualizado com sucesso!'.
- The page remained on the 'Perfil' tab and did not navigate to the dashboard.
- The URL and visible UI elements indicate the user is still on /dashboard/perfil.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/78d42e91-8d4d-4204-b9ce-1e85c057241b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Starting a Gabaritos-cost exam deducts once
- **Test Code:** [TC006_Starting_a_Gabaritos_cost_exam_deducts_once.py](./TC006_Starting_a_Gabaritos_cost_exam_deducts_once.py)
- **Test Error:** TEST BLOCKED

The test cannot proceed because the account does not have enough Gabaritos to create/start the practice exam.

Observations:
- The 'Saldo Insuficiente' modal appeared after attempting to create the simulado.
- The modal shows the simulado cost is 10 Gabaritos and the user's balance is 0.
- Creating the simulado is blocked; acquiring Gabaritos requires visiting the store (not completed in this test).
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/eca138ae-df2d-4a83-afa9-3e454cbbe524
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Study schedule cards appear after creating a schedule
- **Test Code:** [TC007_Study_schedule_cards_appear_after_creating_a_schedule.py](./TC007_Study_schedule_cards_appear_after_creating_a_schedule.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/b8ff8310-5a5b-4974-94b2-50d522342083
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Create a text-only post and see it in the feed
- **Test Code:** [TC008_Create_a_text_only_post_and_see_it_in_the_feed.py](./TC008_Create_a_text_only_post_and_see_it_in_the_feed.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/96ab57e3-c7e3-463b-89ef-95d0c54fe60d
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 View profile with XP and Gabaritos balances
- **Test Code:** [TC009_View_profile_with_XP_and_Gabaritos_balances.py](./TC009_View_profile_with_XP_and_Gabaritos_balances.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/03223811-0593-4737-82c0-d30a03340728
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Search for users and send a friend request
- **Test Code:** [TC010_Search_for_users_and_send_a_friend_request.py](./TC010_Search_for_users_and_send_a_friend_request.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/919cb06b-c6d0-4aef-a47b-c15b9e130204
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Edit name and bio and persist changes
- **Test Code:** [TC011_Edit_name_and_bio_and_persist_changes.py](./TC011_Edit_name_and_bio_and_persist_changes.py)
- **Test Error:** TEST FAILURE

The profile page does not include a bio/about field, so the profile bio could not be updated.

Observations:
- The profile settings page is open and shows the 'Nome' input and 'Salvar Alterações' button.
- No bio/about textarea or input was found on the page.
- Because the bio field is missing, the requested bio update and verification cannot be completed.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/b2f58aa7-f29b-4bd7-bca3-54b6c0769b36
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Open schedule details shows timeline and subject breakdown
- **Test Code:** [TC012_Open_schedule_details_shows_timeline_and_subject_breakdown.py](./TC012_Open_schedule_details_shows_timeline_and_subject_breakdown.py)
- **Test Error:** TEST FAILURE

Opening the schedule card did not show its detail view — the timeline and subject breakdown did not render.

Observations:
- After clicking the schedule card the page showed an empty DOM with 0 interactive elements.
- The schedule list still displays the created card and 'Clique para ver detalhes', but no timeline labels or the subject/topic names (no 'Linha do Tempo', 'Matemática', or 'Álgebra') appeared.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/11f3f151-4e81-4a87-aeca-662280a541ea
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Like a post and add a comment
- **Test Code:** [TC013_Like_a_post_and_add_a_comment.py](./TC013_Like_a_post_and_add_a_comment.py)
- **Test Error:** TEST FAILURE

Posting a comment did not add the comment under the post.

Observations:
- After clicking 'Enviar', the page still shows 'Nenhum comentário ainda.'
- The comment input still contains 'Comment TC002' (the text was not posted)
- The like button displays 'Descurtir (1)', so the like appears applied but the comment was not created
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/c037ab6f-4825-44ba-8cf5-745040f3f369
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Track study progress persists after reload
- **Test Code:** [TC014_Track_study_progress_persists_after_reload.py](./TC014_Track_study_progress_persists_after_reload.py)
- **Test Error:** TEST BLOCKED

The test cannot continue because the app UI stopped rendering and navigation failed.

Observations:
- After creating the schedule, attempts to open its details produced an empty DOM with 0 interactive elements.
- A subsequent reload/navigation failed with a keepalive ping timeout (internal error), preventing reopening the schedule and marking progress.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/15a7e012-8ddb-40e0-908f-6b843f895193
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Accept an incoming friend request and see the new friend
- **Test Code:** [TC015_Accept_an_incoming_friend_request_and_see_the_new_friend.py](./TC015_Accept_an_incoming_friend_request_and_see_the_new_friend.py)
- **Test Error:** TEST BLOCKED

There are no incoming friend requests to accept for this account, so the test cannot proceed.

Observations:
- The Amigos page shows "Meus Amigos (0)" indicating no friends.
- Clicking the Notifications area repeatedly did not reveal any incoming friend request items.
- There is no way from this single account to create an incoming request; a second account or preexisting request is required.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/772e3956-4378-40d9-b4f1-f738414cf640
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Change password from profile settings
- **Test Code:** [TC016_Change_password_from_profile_settings.py](./TC016_Change_password_from_profile_settings.py)
- **Test Error:** TEST FAILURE

Submitting the password-reset request did not produce a visible confirmation message.

Observations:
- The 'Segurança da conta' card only showed a transient 'Enviando...' state, then reverted to the original prompt and button.
- No final confirmation such as 'Enviado' or 'Link enviado' appeared; the button 'Enviar link para trocar senha' is visible.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/74ee52a8-aef8-4965-8e2f-ee9fb3696e58
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 Practice exam answers persist when revisiting questions
- **Test Code:** [TC017_Practice_exam_answers_persist_when_revisiting_questions.py](./TC017_Practice_exam_answers_persist_when_revisiting_questions.py)
- **Test Error:** TEST FAILURE

Could not verify answer persistence because the app immediately completed the simulado and showed the review screen when opening the exam, preventing a mid-exam navigate-away/return test.

Observations:
- Opening the simulado consistently leads to the 'Simulado Concluído' review screen rather than an active exam interface.
- There were no visible controls to start or answer questions in an active session; only the review of completed answers was shown.
- Multiple attempts to open/start the simulado resulted in the same completed/review state, blocking the required test flow.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/07bdbb70-3009-4598-93ac-2be336a9bb17
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Send a message in an existing conversation
- **Test Code:** [TC018_Send_a_message_in_an_existing_conversation.py](./TC018_Send_a_message_in_an_existing_conversation.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached — there are no other users to add as friends or start a conversation.

Observations:
- The Amigos search returned 'Nenhum usuário disponível encontrado com esse termo.'
- The Chat/Amigos area shows no friends or conversations available to open

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/0564a101-b262-47e2-abbb-1cb0cb10a0d3
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Remove a friend from the friends list
- **Test Code:** [TC019_Remove_a_friend_from_the_friends_list.py](./TC019_Remove_a_friend_from_the_friends_list.py)
- **Test Error:** TEST BLOCKED

I could not run the removal test because there is no existing friend to remove — friend requests remain pending and require the other user to accept.

Observations:
- After clicking 'Adicionar' the app showed a toast: 'Você já enviou uma solicitação para esse usuário'.
- The 'Meus Amigos' section shows: 'Você ainda não tem amigos. Use a busca acima para encontrar outros estudantes!'.
- The UI only sends a friend request; it appears acceptance by the other user is required to create an actual friend entry, so removal cannot be tested from this account.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/839604e0-ac85-4446-97c6-ec757b451f3a
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020 Validate required fields when saving profile
- **Test Code:** [TC020_Validate_required_fields_when_saving_profile.py](./TC020_Validate_required_fields_when_saving_profile.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/b09063ff-663e-4412-a5f0-3cb12917685a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021 Open a user profile from a post
- **Test Code:** [TC021_Open_a_user_profile_from_a_post.py](./TC021_Open_a_user_profile_from_a_post.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/a78adf3d-391f-44e9-868f-25dc11b02953
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC022 Update email from profile settings
- **Test Code:** [TC022_Update_email_from_profile_settings.py](./TC022_Update_email_from_profile_settings.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/49181b2b-b5ee-4eb2-8a21-0d356ed96f22
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC023 View conversation history grouped by date
- **Test Code:** [TC023_View_conversation_history_grouped_by_date.py](./TC023_View_conversation_history_grouped_by_date.py)
- **Test Error:** TEST BLOCKED

The conversation list is empty so the test cannot proceed to verify date group separators in message history.

Observations:
- The conversations panel displays the message 'Nenhum amigo ainda' (no friends yet).
- There are no conversation items or messages to open or scroll through.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/d7de8b5c-9804-40a5-89b1-b9a940b7df36
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC024 Cancel editing does not change profile information
- **Test Code:** [TC024_Cancel_editing_does_not_change_profile_information.py](./TC024_Cancel_editing_does_not_change_profile_information.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/fb9cb043-2e80-4818-9ace-353469ccee8b
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC025 Open a friend profile from the friends list
- **Test Code:** [TC025_Open_a_friend_profile_from_the_friends_list.py](./TC025_Open_a_friend_profile_from_the_friends_list.py)
- **Test Error:** TEST BLOCKED

There are no friends available to open a profile for, and the user search returned no results, so the test cannot be completed.

Observations:
- The "Meus Amigos" panel shows "Você ainda não tem amigos" (0 friends).
- Searching for users with the term 'a' displayed: "Nenhum usuário disponível encontrado com esse termo."
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/b0adc740-1d40-4836-9822-b46b180b1360
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC026 Prevent publishing an empty post
- **Test Code:** [TC026_Prevent_publishing_an_empty_post.py](./TC026_Prevent_publishing_an_empty_post.py)
- **Test Error:** TEST FAILURE

Publishing an empty post did not show any validation message.

Observations:
- Clicked 'Publicar' with the compose textarea empty and no validation or error message appeared.
- The feed showed no new (empty) post but the UI did not indicate why the publish was blocked.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/4c8c2fa3-11de-4c4f-9f6f-ee1a3fe4bcfd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC027 Prevent sending an empty chat message
- **Test Code:** [TC027_Prevent_sending_an_empty_chat_message.py](./TC027_Prevent_sending_an_empty_chat_message.py)
- **Test Error:** TEST BLOCKED

The test cannot proceed because there are no conversations available and no visible UI control to create or start a conversation, so I cannot attempt to send a blank message.

Observations:
- The conversations panel shows the message 'Nenhum amigo ainda' (No friends yet).
- There is no 'new conversation' or friend-adding control visible in the chat area or conversation list.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/53ef63f9-8ada-465e-8723-89ebb70b7484
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC028 Invalid login shows error feedback
- **Test Code:** [TC028_Invalid_login_shows_error_feedback.py](./TC028_Invalid_login_shows_error_feedback.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/56d26680-b2de-4947-a0ff-b276a52dc52e
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC029 View social feed when there are no posts
- **Test Code:** [TC029_View_social_feed_when_there_are_no_posts.py](./TC029_View_social_feed_when_there_are_no_posts.py)
- **Test Error:** TEST FAILURE

The social feed does not display a clear empty state message when there are no posts.

Observations:
- The Mural page shows the post composer and an empty area below, but no 'no posts' or other empty-state message is visible.
- There are no posts listed in the feed area and no placeholder text indicating the feed is empty.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/d5c11cfe-20ec-4a6f-ad04-1d70f99916d2
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC030 Empty chat state when there are no conversations
- **Test Code:** [TC030_Empty_chat_state_when_there_are_no_conversations.py](./TC030_Empty_chat_state_when_there_are_no_conversations.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5f92646e-d0ca-4ad8-bf6c-7f2a49fd1374/684123a2-41b2-422e-908b-6fa28d8640d6
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **43.33** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---