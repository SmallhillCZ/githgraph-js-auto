$(document).ready(function(){
  
    $("form").submit(function(){
      
      var data = JSON.parse($("#input").val());
      
      if(!data) return;
      
      var branchNames = ["master"];
    
      var parentBranch = {};
      
      var gitgraph = new GitGraph({
        template: "metro",
        orientation: "vertical",
        mode: "compact"
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
          name: branchNames.pop() || "branch",
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