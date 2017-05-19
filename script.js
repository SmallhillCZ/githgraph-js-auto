$(document).ready(function(){

  $("#addTextarea").click(function(){$(this).before("<textarea class=\"input\"></textarea><br>");});

  $("#showGraphButton").click(function(){

    var data = [];
    
    $("textarea.input").each(function(){
      var newData = JSON.parse($(this).val());
      if(newData && newData.commits.constructor === Array) data = data.concat(newData.commits);
    });
    
    data.sort(function(a,b){return a.time - b.time;});

    if(!data.length) return;

    var branchNames = ["master"];

    var parentBranch = {};

    var template = $("#theme").val();

    if(template === "smallhill"){
      template = new GitGraph.Template({
        arrow: {active:true},
        colors: ["#000000","#3498db", "#2ecc71", "#8e44ad","#f1c40f","#e67e22","#e74c3c"],
        branch: {
          lineWidth: 10,
          spacingX: 50,
          labelRotation: 0
        },
        commit: {
          spacingY: -80,
          dot: {
            size: 14
          },
          message: {
            font: "normal 14pt Arial",
            display:true,
            messageAuthorDisplay: false,
            messageBranchDisplay: false,
            messageHashDisplay: true
          },
          shouldDisplayTooltipsInCompactMode: false, // default = true
          tooltipHTMLFormatter: function (commit) {
            return commit.message;
          }
        }
      });
    }

    var gitgraph = new GitGraph({
      template: template,
      orientation: $("#orientation").val(),
      mode: $("#display").val()
    });

    function getBranch(parent){
      if(parentBranch[parent]) return parentBranch[parent];
      return createBranch(null,branchNames.pop() || "branch");
    }

    function createCommit(branch,commit){
      return branch.commit({
        "sha1": commit.id,
        "message": commit.message
      });
    }

    function createBranch(branch,space){
      return gitgraph.branch({
        parentBranch: branch,
        name: branchNames.pop() || "branch " + space,
        column: space
      });
    }

    var commit; 

    while(commit = data.shift()){

      var branch;

      if(commit.parents.length === 0){

        branch = parentBranch[commit.id] = createBranch(null,commit.space);

        createCommit(branch,commit);
      }

      if(commit.parents.length === 1 && commit.space === commit.parents[0][2]){

        branch = parentBranch[commit.id] = getBranch(commit.parents[0][0]);

        createCommit(branch,commit);
      }

      if(commit.parents.length === 1 && commit.space !== commit.parents[0][2]){

        branch = parentBranch[commit.id] = createBranch(getBranch(commit.parents[0][0]),commit.space);

        createCommit(branch,commit);
      }

      if(commit.parents.length === 2){
        
        if(commit.space === commit.parents[0][2]){
          branch = getBranch(commit.parents[0][0]);
          getBranch(commit.parents[1][0]).merge(branch,{ message: commit.message });
        }
        else{
          branch = createBranch(getBranch(commit.parents[0][0]),commit.space);
          getBranch(commit.parents[1][0]).merge(branch,{ message: commit.message });
        }

        parentBranch[commit.id] = branch;

      }


    }
  });

});