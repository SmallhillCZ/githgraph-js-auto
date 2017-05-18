$(document).ready(function(){
  
    $("form").submit(function(){
      
      var data = JSON.parse($("#input").val());
      
      if(!data) return;
      
      var branchNames = ["master"];
    
      var parentBranch = {};
      
      var template = $("#theme").val();
      
      if(template === "smallhill"){
        template = new GitGraph.Template({
          colors: ["#979797", "#008fb5", "#f1c109"],
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
              font: "normal 14pt Arial"
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
      
      while(commit = data.commits.shift()){
        
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
          
          getBranch(commit.parents[1][0]).merge(getBranch(commit.parents[0][0]),{ message: commit.message });
          
          parentBranch[commit.id] = getBranch(commit.parents[0][0]);
          
        }
        
        
      }
      
      return false;
    });

});