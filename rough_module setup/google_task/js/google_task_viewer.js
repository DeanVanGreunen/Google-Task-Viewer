    var GoogleTaskViewer = {
      // Required Fields
      Google_API_Key: '',
      Google_Client_id: '',
      Google_Client_Secret: '',
      API_Scope: 'profile https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/tasks.readonly',
      setGAPI: function(key, client_id, secret){
        GoogleTaskViewer.Google_API_Key=key;
        GoogleTaskViewer.Google_Client_id=client_id;
        GoogleTaskViewer.Google_Client_Secret=secret;
      },
      discoveryDocs: ["https://people.googleapis.com/$discovery/rest?version=v1","https://tasks.googleapis.com/$discovery/rest?version=v2"],
      Task_List_Title: null,
      /* Format Helpers */
      pad: function(n){return n<10 ? '0'+n : n},
      toISODateString: function (d){
        return d.getUTCFullYear()+'-'+ GoogleTaskViewer.pad(d.getUTCMonth()+1)+'-'+ GoogleTaskViewer.pad(d.getUTCDate())+'T'+ GoogleTaskViewer.pad(d.getUTCHours())+':'+ GoogleTaskViewer.pad(d.getUTCMinutes())+':'+ GoogleTaskViewer.pad(d.getUTCSeconds())+'Z';
      },
      
      /* Google Helper Functions */
      google_helper: {
        initClient: function(){
          // Initialize the client with API key and People API, and initialize OAuth with an
          // OAuth 2.0 client ID and scopes (space delimited string) to request access.
          gapi.client.init({
            apiKey: GoogleTaskViewer.Google_API_Key,
            discoveryDocs: GoogleTaskViewer.discoveryDocs,
            clientId: GoogleTaskViewer.Google_Client_id,
            scope: GoogleTaskViewer.API_Scope
          }).then(function () {
            // Listen for sign-in state changes.
            console.log("initClient Setup Complete");
          });
        },
        initAuth: function(){
          gapi.auth2.init({
              apiKey: GoogleTaskViewer.Google_API_Key,
              clientId: GoogleTaskViewer.Google_Client_id,
              scope: GoogleTaskViewer.API_Scope
          }).then(function(){
            console.log("initAuth Setup Complete");
            gapi.client.load('tasks','v1');
            GoogleTaskViewer.google_helper.signOut();
            gapi.auth2.getAuthInstance().isSignedIn.listen(GoogleTaskViewer.google_helper.updateSigninStatus);
            GoogleTaskViewer.google_helper.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            GoogleTaskViewer.google_helper.isSignedIn=gapi.auth2.getAuthInstance().isSignedIn.get();
          });
        },
        isSignedIn: false,
        signIn: function(event){
          gapi.auth2.getAuthInstance().signIn();
        },
        signOut: function(event){
          gapi.auth2.getAuthInstance().signOut();
        },
        updateSigninStatus: function(isSignedIn) {
          // When signin status changes, this function is called.
          // If the signin status is changed to signedIn, we make an API call.
          GoogleTaskViewer.google_helper.isSignedIn=isSignedIn;
          GoogleTaskViewer.ViewAPI.LoadUI();
        }
      },
      // Setup Google Task Viewer
      setup: function(){
        console.log("Setting Up");
        console.log("Load Google API Client + Initializing Google Auth Client");
        $('head').append('<meta name="google-signin-client_id" content="'+GoogleTaskViewer.Google_Client_id+'">');
        gapi.load('client:auth2', function(){
          GoogleTaskViewer.google_helper.initClient();
          GoogleTaskViewer.google_helper.initAuth();
        });
      },

      // View API
      ViewAPI: {
        LoadUI: function(){
          console.log("GoogleTaskViewer.ViewAPI.LoadUI");
          // Load Task List Title to "Username's Task List"
          // Make an API call to the People API, and get the user's given name.
          $("#google_task_viewer").html(    
            '<div id="google_task_view_panel">'+
                '<div id="google_task_view_panel_header">'+
                '<div id="google_task_view_panel_header_title">'+
                  '<span>Task List</span>'+
                '</div>'+
                '<div id="google_task_view_panel_header_btns">'+
                  '<button title="Logout" id="google_task_view_panel_header_logout_btn">'+
                    '<img src="img/logout.png" alt="Logout" />'+
                  '</button>'+
                  '<button title="Create New Task" id="google_task_view_panel_header_new_task_btn">'+
                    '<img src="img/new_task.png" alt="Create New Task" />'+
                  '</button>'+
                '</div>'+
                '<div id="google_task_view_panel_list_panel"></div>'+
              '</div>'+
              '<div id="google_model_box_new_task_panel">'+
                '<div class="google_model_box_new_task_panel_header">'+
                  '<span>New Task</span>'+
                  '<button id="google_model_box_new_task_panel_close_dialog">'+
                    '<img src="img/cross.png" />'+
                  '</button>'+
                '</div>'+
                '<div class="google_model_box_new_task_panel_label">'+
                  '<span>Task Title</span>'+
                  '<input id="google_model_box_new_task_panel_task_title" type="text" value="" placeholder="Enter a title." />'+
                '</div>'+
                '<div class="google_model_box_new_task_panel_label">'+
                  '<span>Task Description</span>'+
                  '<textarea id="google_model_box_new_task_panel_task_description" cols="30" rows="10" placeholder="Enter a description"></textarea>'+
                '</div>'+
                '<div class="google_model_box_new_task_panel_label">'+
                  '<span>Due Date</span>'+
                  '<input id="google_model_box_new_task_panel_task_due_date" type="text" value="" placeholder="Click to select a date" />'+
                '</div>'+
                '<div class="google_model_box_new_task_panel_label">'+
                  '<input id="google_model_box_new_task_panel_task_save_btn" type="button" value="Save">'+
                '</div>'+
              '</div>'+
              '<div id="google_model_box_view_task_panel">'+
                '<div class="google_model_box_view_task_panel_header">'+
                  '<span>View Task</span>'+
                  '<button id="google_model_box_view_task_panel_close_dialog">'+
                    '<img src="img/cross.png" />'+
                  '</button>'+
                '</div>'+
                '<div class="google_model_box_view_task_panel_label">'+
                  '<span>Task Title</span>'+
                  '<input id="google_model_box_view_task_panel_task_id" type="hidden" value="" />'+
                  '<input id="google_model_box_view_task_panel_task_title" type="text" value="" placeholder="No Title" readonly="readyonly" />'+
                '</div>'+
                '<div class="google_model_box_view_task_panel_label">'+
                  '<span>Task Description</span>'+
                  '<textarea id="google_model_box_view_task_panel_task_description" cols="30" rows="10" placeholder="No Description" readonly="readonly"></textarea>'+
                '</div>'+
                '<div class="google_model_box_view_task_panel_label">'+
                  '<span>Due Date</span>'+
                  '<input id="google_model_box_view_task_panel_task_due_date" type="text" value="" placeholder="No Due Date" readonly="readonly"/>'+
                '</div>'+
                '<div class="google_model_box_view_task_panel_label">'+
                  '<input id="google_model_box_view_task_panel_task_ok_btn" type="button" value="Ok">'+
                '</div>'+
              '</div>'+
              '<div id="google_model_box_edit_task_panel">'+
                '<div class="google_model_box_edit_task_panel_header">'+
                  '<span>Edit Task</span>'+
                  '<button id="google_model_box_edit_task_panel_close_dialog">'+
                    '<img src="img/cross.png" />'+
                  '</button>'+
                '</div>'+
                '<div class="google_model_box_edit_task_panel_label">'+
                  '<span>Task Title</span>'+
                  '<input id="google_model_box_edit_task_panel_task_id" type="hidden" value="" />'+
                  '<input id="google_model_box_edit_task_panel_task_title" type="text" value="" placeholder="Enter a title." />'+
                '</div>'+
                '<div class="google_model_box_edit_task_panel_label">'+
                  '<span>Task Description</span>'+
                  '<textarea id="google_model_box_edit_task_panel_task_description" cols="30" rows="10" placeholder="Enter a description"></textarea>'+
                '</div>'+
                '<div class="google_model_box_edit_task_panel_label">'+
                  '<span>Due Date</span>'+
                  '<input id="google_model_box_edit_task_panel_task_due_date" type="text" value="" placeholder="Click to select a date" />'+
                '</div>'+
                '<div class="google_model_box_edit_task_panel_label">'+
                  '<input id="google_model_box_edit_task_panel_task_update_btn" type="button" value="Update">'+
                '</div>'+
              '</div>'+
              '<div id="google_model_box_delete_task_panel">'+
                '<div class="google_model_box_delete_task_panel_header">'+
                  '<span>Delete Task</span>'+
                '</div>'+
                '<div class="google_model_box_delete_task_panel_label">'+
                  '<span id="google_model_box_delete_task_panel_label_title">Are You sure you want to delete the task \'\'</span>'+
                  '<input id="google_model_box_delete_task_panel_task_id" type="hidden" value="" />'+
                  '<div id="google_model_box_delete_task_panel_task_btns">'+
                    '<button id="google_model_box_delete_task_panel_task_btn_yes">Yes</button>'+
                    '<button id="google_model_box_delete_task_panel_task_btn_no">No</button>'+
                  '</div>'+
                '</div>'+
                '</div>'+
            '</div>'+
            '<div id="google_authenticate">'+
              '<div id="google_authenticate_login_before">'+
                '<span>Google Task Viewer</span>'+
              '</div>'+
              '<div id="google_authenticate_login">'+
                '<button class="btn-5" id="google_authenticate_login_btn">'+
                  '<img id="google_authenticate_login_btn_img" src="img/login_with_google.png" alt="Login With Google" />'+
                '</button>'+
              '</div>'+
              '<div id="google_authenticate_login_after">'+
                '<span>by <a href="mailto:deanvg9000@gmail.com">Dean Van Greunen</a></span>'+
              '</div>'+
            '</div>'
            );
          $("#google_authenticate_login_btn").click(function(){
            GoogleTaskViewer.google_helper.signIn();
          });
       
          $("#google_task_view_panel_header_logout_btn").click(function(){
            GoogleTaskViewer.google_helper.signOut();
          });

          $('#google_task_view_panel_header_new_task_btn').click(function(){
            GoogleTaskViewer.ViewAPI.ListUI.New();
          });

          if(GoogleTaskViewer.google_helper.isSignedIn){
            gapi.client.people.people.get({
              'resourceName': 'people/me',
              'requestMask.includeField': 'person.names'
            }).then(function(response) {
              //Get Title & Save
              GoogleTaskViewer.Task_List_Title = response.result.names[0].givenName+"'s Task List";

              // Set List Title
              GoogleTaskViewer.ViewAPI.setTitle(GoogleTaskViewer.Task_List_Title);

              // Load Task List
              GoogleTaskViewer.ViewAPI.ListUI.Load();

              // Display Task List View Panel
              $("#google_task_view_panel").show();

              //Load Task List
              GoogleTaskViewer.ViewAPI.ListUI.Load();

              // Hide Chidren Panels
              GoogleTaskViewer.ViewAPI.HideSubPanels();

              // Hide Authenticate/Login Panel
              $("#google_authenticate").hide();
            }, function(reason) {
              console.log('Error: ' + reason.result.error.message);
            });
          } else {
              $("#google_task_view_panel").hide();
              $("#google_authenticate").show();
          }
        },
        HideSubPanels: function(){
          $('#google_authenticate').hide();
          $('#google_model_box_new_task_panel').hide();
          $('#google_model_box_view_task_panel').hide();
          $('#google_model_box_edit_task_panel').hide();
          $('#google_model_box_delete_task_panel').hide();
        },
        ShowViewPanels: function(){
          GoogleTaskViewer.ViewAPI.HideSubPanels();
          $('#google_task_view_panel_header').show();
          $('#google_task_view_panel_list_panel').show();
          $('#google_authenticate').hide();
        },
        HideViewPanels: function(){
          $('#google_task_view_panel_header').hide();
          $('#google_task_view_panel_list_panel').hide();
        },
        ShowNewTaskPanel: function(){
          $('#google_model_box_new_task_panel').show();
          // enableds Calender jQuery UI Module for input.
          $('#google_model_box_new_task_panel_task_due_date').datepicker();
          $('#google_model_box_new_task_panel_close_dialog').click(function(){
            $('#google_model_box_new_task_panel').hide();
            GoogleTaskViewer.ViewAPI.ShowViewPanels();
          });
          $('#google_model_box_new_task_panel_task_save_btn').click(function(){
            gapi.client.tasks.tasks.insert({
              'tasklist':'@default',
              'title': $('#google_model_box_new_task_panel_task_title').val(),
              "due": GoogleTaskViewer.toISODateString(new Date($('#google_model_box_new_task_panel_task_due_date').val())),
              "notes": $('#google_model_box_new_task_panel_task_description').val(),
            }).then(function(){
              //reload UI
              console.log("Created New Task");
              GoogleTaskViewer.ViewAPI.LoadUI();
            });
          });
        },
        ShowViewTaskPanel: function(task_id){
          GoogleTaskViewer.ViewAPI.HideSubPanels();
          $('#google_model_box_view_task_panel_task_id').val(task_id);
          $('#google_model_box_view_task_panel_close_dialog').click(function(){
            $('#google_model_box_view_task_panel').hide();
            GoogleTaskViewer.ViewAPI.ShowViewPanels();
          });
          $('#google_model_box_view_task_panel_task_ok_btn').click(function(){
            $('#google_model_box_view_task_panel').hide();
            GoogleTaskViewer.ViewAPI.ShowViewPanels();
          });
          gapi.client.tasks.tasks.get({'tasklist':'@default', 'task':task_id}).then(function(response){
            $('#google_model_box_view_task_panel_task_title').val(response.result.title);
            console.log(response.result);

            if(response.result.notes){
              $('#google_model_box_view_task_panel_task_description').val(response.result.notes);
            }
            if(response.result.due){
              $('#google_model_box_view_task_panel_task_due_date').val(response.result.due.split('T')[0]);
            }
            $('#google_model_box_view_task_panel').show();
          });
        },
        ShowEditTaskPanel: function(task_id){
          $('#google_model_box_edit_task_panel').show();
          $('#google_model_box_edit_task_panel_task_id').val(task_id);
          $('#google_model_box_edit_task_panel_close_dialog').click(function(){
            $('#google_model_box_edit_task_panel').hide();
            GoogleTaskViewer.ViewAPI.ShowViewPanels();
          });
          $('#google_model_box_edit_task_panel_task_update_btn').click(function(){
            //update here
            gapi.client.tasks.tasks.delete({
              'tasklist':'@default',
              'task': task_id,
            }).then(function(){
              updated = GoogleTaskViewer.toISODateString(new Date());
              gapi.client.tasks.tasks.insert({
                'tasklist':'@default',
                'task': task_id,
                'title': $('#google_model_box_edit_task_panel_task_title').val(),
                "due": GoogleTaskViewer.toISODateString(new Date($('#google_model_box_edit_task_panel_task_due_date').val())),
                "notes": $('#google_model_box_edit_task_panel_task_description').val()
              }).then(function(){
                //reload UI
                console.log("Updated Task");
                GoogleTaskViewer.ViewAPI.LoadUI();
              });
            });
          });

          gapi.client.tasks.tasks.get({'tasklist':'@default',  'task':task_id}).then(function(response){
            $('#google_model_box_edit_task_panel_task_title').val(response.result.title);
            if(response.result.notes){
              $('#google_model_box_edit_task_panel_task_description').val(response.result.notes);
            }
            $('#google_model_box_edit_task_panel_task_due_date').datepicker();
            if(response.result.due){
              $('#google_model_box_edit_task_panel_task_due_date').val(response.result.due.split('T')[0]);
            }
          });
        },
        ShowDeleteTaskPanel: function(task_id, task_title){
          $('#google_model_box_delete_task_panel').show();
          $('#google_model_box_delete_task_panel_label_title').html('Are you sure you want to delete the following task </ br> <b>\''+task_title+'\'</b>');
          $('#google_model_box_delete_task_panel_task_btn_no').click(function(){
            $('#google_model_box_delete_task_panel').hide();
            GoogleTaskViewer.ViewAPI.ShowViewPanels();
          });
          $('#google_model_box_delete_task_panel_task_btn_yes').click(function(){
            $('#google_model_box_delete_task_panel').hide();
            //perform deletion
            gapi.client.tasks.tasks.delete({'tasklist':'@default', 'task':task_id}).then(function(){
              //reload
              GoogleTaskViewer.ViewAPI.ShowViewPanels();
              GoogleTaskViewer.ViewAPI.LoadUI();
            });
          });
        },
        RefreshUI: function(){
          GoogleTaskViewer.setup();
        },
        setTitle: function(title){
          $("#google_task_view_panel_header_title").html("<span>"+title+"</span>");
        },
        ListUI: {
          listFound: false,
          listID: null,
          Load: function(){
            //Load Items That are in this list '%user_name%'+'_dmi_list'
            console.log("Load Task List Items");
            search_by_title = GoogleTaskViewer.Task_List_Title;GoogleTaskViewer.Task_List_Title;
            //load list
            gapi.client.tasks.tasks.list({'tasklist':'@default'}).then(function(response){                    
            //populate list
            console.log("Loading Task List");
            GoogleTaskViewer.ViewAPI.ListUI.Clear();
            for(var i=0;i<response.result.items.length;i++){
              if(response.result.items[i]['title']){
                //skip if title is blank, null, or empty
                console.log('adding item');
                GoogleTaskViewer.ViewAPI.ListUI.Add(response.result.items[i]['id'],response.result.items[i]['title']);
              }
            }
            });
          },
          Clear: function(){
            $("#google_task_view_panel_list_panel").html("");
          },
          Add: function(task_id, task_title){
            $("#google_task_view_panel_list_panel").append(
              '<div class="google_task_view_panel_list_panel_item" data-item="'+task_id+'">'+
                '<div class="google_task_view_panel_list_panel_item_title">'+
                  '<a id="'+task_id+'" class="ellipsis" data-item="'+task_id+'" alt="Open Task">'+task_title+'</a>'+
                '</div>'+
                '<div class="google_task_view_panel_list_panel_item_btn_list">'+
                  '<button class="google_task_view_panel_list_panel_item_btn_list_btn" onclick="GoogleTaskViewer.ViewAPI.ListUI.Delete(\''+task_id+'\',\''+task_title+'\');">'+
                    '<img src="img/bin.png" alt="Delete Task" />'+
                  '</button>'+
                  '<button class="google_task_view_panel_list_panel_item_btn_list_btn" onclick="GoogleTaskViewer.ViewAPI.ListUI.Edit(\''+task_id+'\');">'+
                    '<img src="img/pencil.png" alt="Edit Task" />'+
                  '</button>'+
                  '<button class="google_task_view_panel_list_panel_item_btn_list_btn" onclick="GoogleTaskViewer.ViewAPI.ListUI.MarkAsComplete(\''+task_id+'\');">'+
                    '<img src="img/tick.png" alt="Mark as Complete" />'+
                  '</button>'+
                '</div>'+
              '</div>'
              );
              $('#'+task_id).click(function(event){
                 GoogleTaskViewer.ViewAPI.ListUI.View(task_id);
              });
          },
          New: function(){
            // Display New Task Model odel Box
            GoogleTaskViewer.ViewAPI.HideViewPanels();
            GoogleTaskViewer.ViewAPI.HideSubPanels();
            GoogleTaskViewer.ViewAPI.ShowNewTaskPanel();
          },
          Delete: function(task_id, task_title){
            // Display Yes/No Confirmation Delete Model Box
            GoogleTaskViewer.ViewAPI.HideViewPanels();
            GoogleTaskViewer.ViewAPI.HideSubPanels();
            GoogleTaskViewer.ViewAPI.ShowDeleteTaskPanel(task_id, task_title);
          },
          Edit: function(task_id){
            // Display Task in Edit Model Box
            GoogleTaskViewer.ViewAPI.HideViewPanels();
            GoogleTaskViewer.ViewAPI.HideSubPanels();
            GoogleTaskViewer.ViewAPI.ShowEditTaskPanel(task_id);
          },
          MarkAsComplete: function(task_id){
            // Mark As Complete and Reload List
            // patch and update do not work correctly..
            gapi.client.tasks.tasks.delete({
              'tasklist':'@default',
              'task':task_id
            }).then(function(){
              //reload UI
              console.log("Updated Task");
              GoogleTaskViewer.ViewAPI.LoadUI();
            });
          },
          View: function(task_id){
            // View Task
            GoogleTaskViewer.ViewAPI.HideViewPanels();
            GoogleTaskViewer.ViewAPI.HideSubPanels();
            GoogleTaskViewer.ViewAPI.ShowViewTaskPanel(task_id);
          }
        }

      }
    };